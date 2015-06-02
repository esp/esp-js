"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var esp = _interopRequire(require("../../../esp.js"));

var MainController = (function (_esp$model$DisposableBase) {
    function MainController(router) {
        _classCallCheck(this, MainController);

        _get(Object.getPrototypeOf(MainController.prototype), "constructor", this).call(this);
        this._router = router;
    }

    _inherits(MainController, _esp$model$DisposableBase);

    _createClass(MainController, {
        start: {
            value: function start() {
                var _this = this;

                this._syncWithModel();

                // simulate a user changing something, anything that wants to change the model does so via an event,
                // perhaps a controller sends one in response to a user action (if used in the GUI), or a service receiving requests off the
                // network publishes one (if used on the server)
                setTimeout(function () {
                    _this._router.publishEvent("modelId1", "userChangedNotionalEvent", { notional: 1000000 });
                }, 6000);
            }
        },
        _syncWithModel: {
            value: function _syncWithModel() {
                this.addDisposable(this._router.getModelObservable("modelId1").observe(function (model) {
                    console.log("New model received, [%s]", JSON.stringify(model));
                }));
            }
        }
    });

    return MainController;
})(esp.model.DisposableBase);

module.exports = MainController;