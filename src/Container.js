/* notice_start
 * Copyright 2016 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 notice_end */
 
import * as utils from './utils';
import ResolverContext from './ResolverContext';
import InstanceLifecycleType from './InstanceLifecycleType';
import RegistrationModifier from './RegistrationModifier';
import Guard from './Guard';

export default class Container {
    constructor() {
        this._isChildContainer = false;
        this._parent = undefined;
        this._registrations = {};
        this._registrationGroups = {};
        this._instanceCache = {};
        this._resolverContext = new ResolverContext();
        this._resolvers = this._createDefaultResolvers();
        this._isDisposed = false;
        this._childContainers = [];
    }
    createChildContainer() {
        this._throwIfDisposed();
        // The child prototypically inherits some but not all props from its parent.
        // Below we override the ones it doesn't inherit.
        var child = Object.create(this);
        child._parent = this;
        child._isChildContainer = true;
        child._registrations = Object.create(this._registrations);
        child._registrationGroups = Object.create(this._registrationGroups);
        child._instanceCache = Object.create(this._instanceCache);
        child._resolvers = Object.create(this._resolvers);
        child._isDisposed = false;
        child._childContainers = [];
        this._childContainers.push(child);
        return child;
    }
    register(name, proto) {
        Guard.isString(name, 'Error calling register(name, proto). The name argument must be a string');
        Guard.isTrue(!utils.isString(proto), 'Error calling register(name, proto). Can not register a string instance, use registerInstance()');
        Guard.isTrue(!utils.isNumber(proto), 'Error calling register(name, proto). Can not register a number instance, use registerInstance()');
        this._throwIfDisposed();
        var registration = {
            name: name,
            proto: proto,
            dependencyList: [],
            instanceLifecycleType: InstanceLifecycleType.singleton
        };
        this._registrations[name] = registration;
        return new RegistrationModifier(registration, this._instanceCache, this._registrationGroups);
    }
    registerInstance(name, instance, isExternallyOwned = true) {
        Guard.isString(name, 'Error calling registerInstance(name, instance, isExternallyOwned = true). The name argument must be a string');
        Guard.isNotNullOrUndefined(instance, `Error calling registerInstance(name, instance, isExternallyOwned = true). Provided instance for [${name}] can not be null or undefined`);
        this._throwIfDisposed();
        this._registrations[name] = {
            name: name,
            instanceLifecycleType: isExternallyOwned
                ? InstanceLifecycleType.external
                : InstanceLifecycleType.singleton
        };
        this._instanceCache[name] = instance;
    }
    isRegistered(name) {
        this._throwIfDisposed();
        var registration = this._registrations[name];
        return !!registration;
    }
    resolve(name, ...additionalDependencies) {
        this._throwIfDisposed();
        var registration = this._registrations[name],
            dependency,
            instance,
            error;
        if (!registration) {
            error = utils.sprintf('Nothing registered for dependency [%s]', name);
            throw new Error(error);
        }
        instance = this._tryRetrieveFromCache(name);
        if (!instance) {
            instance = this._buildInstance(name, additionalDependencies);
            if (registration.instanceLifecycleType === InstanceLifecycleType.singleton || registration.instanceLifecycleType === InstanceLifecycleType.singletonPerContainer) {
                this._instanceCache[name] = instance;
            }
        } else if(additionalDependencies.length > 0) {
            throw new Error("The provided additional dependencies can't be used to construct the instance as an existing instance was found in the container");
        }
        return instance;
    }
    resolveGroup(groupName) {
        this._throwIfDisposed();
        var items = [],
            mapings,
            error;
        mapings = this._registrationGroups[groupName];
        if (!mapings) {
            error = utils.sprintf('No group with name [%s] registered', groupName);
            throw new Error(error);
        }
        for (let i = 0, len = mapings.length; i < len; i++) {
            items.push(this.resolve(mapings[i]));
        }
        return items;
    }
    addResolver(name, resolver) {
        this._throwIfDisposed();
        this._resolvers[name] = resolver;
    }
    dispose() {
        this._disposeContainer();
    }
    _tryRetrieveFromCache(name) {
        var registration = this._registrations[name],
            instance = this._instanceCache[name],
            thisContainerOwnsRegistration,
            thisContainerOwnsInstance,
            typeIsSingleton,
            childHasOverriddenRegistration,
            parentRegistrationIsSingletonPerContainer;
        if (this._isChildContainer) {
            thisContainerOwnsRegistration = this._registrations.hasOwnProperty(name);
            if (instance === undefined) {
                typeIsSingleton = registration.instanceLifecycleType === InstanceLifecycleType.singleton;
                // do we have the right to create it, or do we need to defer to the parent?
                if (!thisContainerOwnsRegistration && typeIsSingleton) {
                    // singletons always need to be resolved and stored with the container that owns the
                    // registration, otherwise the cached instance won't live in the right place
                    instance = this._parent.resolve(name);
                }
            } else {
                thisContainerOwnsInstance = this._instanceCache.hasOwnProperty(name);
                if (!thisContainerOwnsInstance) {
                    childHasOverriddenRegistration = thisContainerOwnsRegistration && !thisContainerOwnsInstance;
                    parentRegistrationIsSingletonPerContainer = !thisContainerOwnsRegistration && registration.instanceLifecycleType === InstanceLifecycleType.singletonPerContainer;
                    if (childHasOverriddenRegistration || parentRegistrationIsSingletonPerContainer) {
                        instance = undefined;
                    }
                }
            }
        }
        return instance;
    }
    _buildInstance(name, additionalDependencies) {
        var registration = this._registrations[name],
            dependencies = [],
            dependency,
            dependencyKey,
            context,
            instance,
            resolver;
        context = this._resolverContext.beginResolve(name);
        try {
            if (registration.dependencyList !== undefined) {
                for (let i = 0, len = registration.dependencyList.length; i < len; i++) {
                    dependencyKey = registration.dependencyList[i];
                    if (utils.isString(dependencyKey)) {
                        dependency = this.resolve(dependencyKey);
                    } else if (dependencyKey.hasOwnProperty('resolver') && utils.isString(dependencyKey.resolver)) {
                        resolver = this._resolvers[dependencyKey.resolver];
                        if (resolver === undefined) {
                            throw new Error(utils.sprintf('Error resolving [%s]. No resolver registered to resolve dependency key for resolver [%s]', name, dependencyKey.resolver));
                        }
                        dependency = resolver.resolve(this, dependencyKey);
                    } else {
                        throw new Error(utils.sprintf('Error resolving [%s]. It\'s dependency at index [%s] had an unknown resolver', name, i));
                    }
                    dependencies.push(dependency);
                }
            }
            for(let j = 0, len = additionalDependencies.length; j < len; j ++) {
                dependencies.push(additionalDependencies[j]);
            }
            if(registration.proto.isResolverKey) {
                if(registration.proto.resolver) {
                    resolver = this._resolvers[registration.proto.resolver];
                    instance = resolver.resolve(this, registration.proto);
                }
                else {
                    throw new Error('Registered resolverKey is missing it\'s resolver property');
                }
            } else if (typeof registration.proto === 'function') {
                var Ctor = registration.proto.bind.apply(
                    registration.proto,
                    [null].concat(dependencies)
                );
                instance = new Ctor();
            } else {
                instance = Object.create(registration.proto);
                if (instance.init !== undefined) {
                    instance = instance.init.apply(instance, dependencies) || instance;
                }
            }

        } finally {
            context.endResolve();
        }
        return instance;
    }
    _createDefaultResolvers() {
        return {
            // A resolvers that delegates to the dependency keys resolve method to perform the resolution.
            // It expects a dependency key in format:
            // { resolver: 'factory', resolve: function(container) { return someInstance } }
            delegate: {
                resolve: (container, dependencyKey) => {
                    return dependencyKey.resolve(container);
                }
            },
            // A resolvers that returns a factory that when called will resolve the dependency from the container.
            // Any arguments passed at runtime will be passed to resolve as additional dependencies
            // It expects a dependency key in format:
            // { resolver: 'factory', name: "aDependencyName" }
            factory: {
                resolve: (container, dependencyKey) => {
                    return function() { // using function here as I don't want babel to re-write the arguments var
                        var args = [].slice.call(arguments);
                        args.unshift(dependencyKey.key);
                        return container.resolve.apply(container, args );
                    };
                }
            }
        };
    }
    _throwIfDisposed() {
        if (this._isDisposed) throw new Error("Container has been disposed");
    }
    _disposeContainer() {
        if (!this._isDisposed) {
            this._isDisposed = true;
            for (var prop in  this._instanceCache) {
                if (this._instanceCache.hasOwnProperty(prop)) {
                    var registration = this._registrations[prop];
                    if (registration.instanceLifecycleType !== InstanceLifecycleType.external) {
                        var instance = this._instanceCache[prop];
                        if (instance.dispose) {
                            instance.dispose();
                        }
                    }
                }
            }
            for (var i = 0, len = this._childContainers.length; i < len; i++) {
                var child = this._childContainers[i];
                child._disposeContainer();
            }
        }
    }
}