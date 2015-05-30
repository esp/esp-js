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