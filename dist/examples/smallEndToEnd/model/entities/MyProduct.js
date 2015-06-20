/*
 * Copyright 2015 Keith Woods
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
"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var NotionalField = _interopRequire(require("./NotionalField"));

var AccountsField = _interopRequire(require("./AccountsField"));

var MyProduct = (function () {
    function MyProduct() {
        _classCallCheck(this, MyProduct);

        this._notional = new NotionalField();
        this._accounts = new AccountsField();
        this._longRunningOperationCount = 0;
    }

    _createClass(MyProduct, {
        notional: {
            get: function () {
                return this._notional;
            }
        },
        accounts: {
            get: function () {
                return this._accounts;
            }
        },
        longRunningOperationCount: {
            // you could create 'busy ui' around this prop

            get: function () {
                return this._longRunningOperationCount;
            },
            set: function (value) {
                this._longRunningOperationCount = value;
            }
        },
        lock: {
            // your model should implement lock and unlock methods, the router
            // will call lock just before it give the model out to processors and will
            // call lock when all processors are done. This way only processors will be
            // able to change it. Obviously something else could call unlock, ATM it should
            // only be the router, and this could be better enforced with a later release.

            value: function lock() {}
        },
        unlock: {
            value: function unlock() {}
        }
    });

    return MyProduct;
})();

module.exports = MyProduct;