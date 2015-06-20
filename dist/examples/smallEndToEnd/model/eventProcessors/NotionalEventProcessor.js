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

var NotionalEventProcessor = (function (_esp$model$DisposableBase) {
    function NotionalEventProcessor(router) {
        _classCallCheck(this, NotionalEventProcessor);

        _get(Object.getPrototypeOf(NotionalEventProcessor.prototype), "constructor", this).call(this);
        this._router = router;
    }

    _inherits(NotionalEventProcessor, _esp$model$DisposableBase);

    _createClass(NotionalEventProcessor, {
        start: {
            value: function start() {
                this._observeInitEvent();
                this._observeUserChangedNotionalEvent();
            }
        },
        _observeInitEvent: {
            value: function _observeInitEvent() {
                this.addDisposable(this._router.getEventObservable("modelId1", "initEvent").observe(function (model, event) {
                    // set the default notional
                    model.notional.value = event.notional;
                }));
            }
        },
        _observeUserChangedNotionalEvent: {
            value: function _observeUserChangedNotionalEvent() {
                this.addDisposable(this._router.getEventObservable("modelId1", "userChangedNotionalEvent").observe(function (model, event) {
                    console.log("Processing userChangedNotionalEvent event");
                    model.notional.value = event.notional;
                }));
            }
        }
    });

    return NotionalEventProcessor;
})(esp.model.DisposableBase);

module.exports = NotionalEventProcessor;