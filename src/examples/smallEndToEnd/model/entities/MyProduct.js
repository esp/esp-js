/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import NotionalField from './NotionalField';
import AccountsField from './AccountsField';

class MyProduct {
    constructor() {
        this._notional = new NotionalField();
        this._accounts = new AccountsField();
        this._longRunningOperationCount = 0;
    }
    get notional() {
        return this._notional;
    }
    get accounts() {
        return this._accounts;
    }
    // you could create 'busy ui' around this prop
    get longRunningOperationCount() {
        return this._longRunningOperationCount;
    }
    set longRunningOperationCount(value) {
        this._longRunningOperationCount = value;
    }
    // your model should implement lock and unlock methods, the router
    // will call lock just before it give the model out to processors and will
    // call lock when all processors are done. This way only processors will be
    // able to change it. Obviously something else could call unlock, ATM it should
    // only be the router, and this could be better enforced with a later release.
    lock() {
    }
    unlock() {
    }
}

export default MyProduct;