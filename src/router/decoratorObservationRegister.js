import { removeAll } from '../system/utils';

export default class DecoratorObservationRegister {
    constructor() {
        this._registrations = {};
    }
    register(modelId, object) {
        let items = this._registrations[modelId];
        if(!items) {
            items = [];
            this._registrations[modelId] = items;
        }
        if(!this.isRegistered(modelId, object)) {
            items.push(object);
        }
    }
    isRegistered(modelId, object) {
        if(!this._registrations.hasOwnProperty(modelId)) {
            return false;
        }
        let items = this._registrations[modelId];
        for(let i = 0; i < items.length; i++) {
            if(items[i] === object) {
                return true;
            }
        }
        return false;
    }
    removeRegistration(modelId, object) {
        if(this.isRegistered(modelId, object)) {
            let items = this._registrations[modelId];
            removeAll(items, object);
        }
    }
}