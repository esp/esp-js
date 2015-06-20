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

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var esp = _interopRequire(require("../../../../esp.js"));

var StaticDataEventProcessor = (function (_esp$model$DisposableBase) {
    function StaticDataEventProcessor(router) {
        _classCallCheck(this, StaticDataEventProcessor);

        _get(Object.getPrototypeOf(StaticDataEventProcessor.prototype), "constructor", this).call(this);
        this._router = router;
    }

    _inherits(StaticDataEventProcessor, _esp$model$DisposableBase);

    _createClass(StaticDataEventProcessor, {
        start: {
            value: function start() {
                this._observeInitEvent();
            }
        },
        _observeInitEvent: {
            value: function _observeInitEvent() {
                this.addDisposable(this._router.getEventObservable("modelId1", "initEvent").beginWork(function (model, event, eventContext, onResultsReceived) {
                    // fake getting accounts async
                    model.longRunningOperationCount++;
                    setTimeout(function () {
                        console.log("Accounts received async, posting");
                        onResultsReceived({ accounts: ["Account1", "Account2"] });
                    }, 4000);
                }).observe(function (model, event) {
                    console.log("Applying accounts to the model");
                    model.longRunningOperationCount--;
                    model.accounts.value = event.results.accounts;
                }));
            }
        }
    });

    return StaticDataEventProcessor;
})(esp.model.DisposableBase);

module.exports = StaticDataEventProcessor;