import * as utils from './utils';
import InstanceLifecycleType from './InstanceLifecycleType';

export default class RegistrationModifier  {
    constructor(registration, instanceCache, registrationGroups) {
        this._registration = registration;
        this._instanceCache = instanceCache;
        this._registrationGroups = registrationGroups;
        this.singleton();
    }
    inject(){
        this._ensureInstanceNotCreated();
        var dependencyList = Array.prototype.slice.call(arguments);
        this._validateDependencyList(dependencyList);
        this._registration.dependencyList = dependencyList;
        return this;
    }
    transient() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.transient;
        return this;
    }
    singleton() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.singleton;
        return this;
    }
    singletonPerContainer() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.singletonPerContainer;
        return this;
    }
    inGroup(groupName) {
        this._ensureInstanceNotCreated();
        var currentContainerOwnsRegistration = true;
        var lookup = this._registrationGroups[groupName];
        if(lookup) {
            // Groups are resolved against the container they are registered against.
            // Child containers will inherit the group unless the child overwrites the registration.
            currentContainerOwnsRegistration = this._registrationGroups.hasOwnProperty(groupName);
        }
        if(lookup === undefined || !currentContainerOwnsRegistration) {
            lookup = [];
            this._registrationGroups[groupName] = lookup;
        }
        if(utils.indexOf(lookup, this._registration.name) !== -1) {
            throw new Error(utils.sprintf('Instance already created for key [%s]', this._registration.name));
        }
        lookup.push(this._registration.name);
        return this;
    }
    _ensureInstanceNotCreated() {
        if(this._registration.hasOwnProperty(this._registration.name) && this._instanceCache.hasOwnProperty(this._registration.name))
            throw new Error(utils.sprintf('Instance already created for key [%s]', this._registration.name));
    }
    _validateDependencyList(dependencyList) {
        // TODO
    }
}