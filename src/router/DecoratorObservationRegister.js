// notice_start
/*
 * Copyright 2015 Dev Shop Limited
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
 */
// notice_end

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