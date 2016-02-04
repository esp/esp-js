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

import { ModelBase } from './ModelBase';

/**
 * A base class for the root model entity.
 *
 * You don't need to derive from this to use the router, provided as a convenience
 */
export class ModelRootBase extends ModelBase {
    constructor() {
        super();
        this._isLocked = true;
        this._checkIsLocked = (function(){
            return this._isLocked;
        }).bind(this);
    }
    lock() {
        this._isLocked = true;
    }
    unlock() {
        this._isLocked = false;
    }
    bindLockPredicate() {
        this._bindLockPredicate(this);
    }
    _bindLockPredicate(parent) {
        parent = parent || this;
        for (var key in parent) {
            if(parent.hasOwnProperty(key)) {
                var o = parent[key];
                if (o instanceof ModelBase) {
                    o._checkIsLocked = this._checkIsLocked;
                    this._bindLockPredicate(o);
                }
            }
        }
    }
}
