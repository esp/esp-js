"use strict";

var _interopRequireWildcard = function (obj) { return obj && obj.__esModule ? obj : { "default": obj }; };

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var MyProduct = _interopRequire(require("./entities/MyProduct"));

var eventProcessors = _interopRequireWildcard(require("./eventProcessors/index"));

var ModelBootstrapper = (function () {
    function ModelBootstrapper(router) {
        _classCallCheck(this, ModelBootstrapper);

        this._router = router;
    }

    _createClass(ModelBootstrapper, {
        start: {
            value: function start() {

                // create our single instance model
                var model = new MyProduct();
                // give it to the event router and give it a unique id
                this._router.registerModel("modelId1", model);

                // start some event processors, for simplicity we just statically define them here,
                // in reality they may come and go as the model expands and contracts, or they may
                // get resolved from a container. EventProcessors are not part of the MER, they are just
                // a satellite pattern and are responsible for receiving events and mutating the model.
                var notionalEventProcessor = new eventProcessors.NotionalEventProcessor(this._router);
                notionalEventProcessor.start();
                var staticDataEventProcessor = new eventProcessors.StaticDataEventProcessor(this._router);
                staticDataEventProcessor.start();

                // fire an initial event to setup the model, this will be dispatched to any processors that observe it
                // when all processors are done an updated model will be sent on the routers change stream
                var initialSetupEvent = { notional: 0 };
                this._router.publishEvent("modelId1", "initEvent", initialSetupEvent);
            }
        }
    });

    return ModelBootstrapper;
})();

module.exports = ModelBootstrapper;