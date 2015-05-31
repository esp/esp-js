import utils from './utils';
import InstanceLifecycleType from './InstanceLifecycleType';

export default class InstanceLifecycle  {
    constructor(registration, instanceCache) {
        this._registration = registration;
        this._instanceCache = instanceCache;
        this.singleton();
    }
    transient() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.transient;
    }
    singleton() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.singleton;
    }
    singletonPerContainer() {
        this._ensureInstanceNotCreated();
        this._registration.instanceLifecycleType = InstanceLifecycleType.singletonPerContainer;
    }
    _ensureInstanceNotCreated() {
        if(this._registration.hasOwnProperty(this._registration.name) && this._instanceCache.hasOwnProperty(this._registration.name))
            throw new Error(utils.sprintf('Instance already created for key [%s]', this._registration.name));
    }
}