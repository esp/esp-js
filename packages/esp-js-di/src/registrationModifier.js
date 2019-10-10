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
import InstanceLifecycleType from './instanceLifecycleType';
import Guard from './guard';

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
        Guard.isNonEmptyString(groupName, 'Error calling inGroup(groupName). The name argument must be a string and can not be \'\'');
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