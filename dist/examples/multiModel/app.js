"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

var esp = _interopRequire(require("../../esp.js"));

var ProductionLine = (function () {
    function ProductionLine() {
        _classCallCheck(this, ProductionLine);

        this._cars = {};
        this._totalCarCost = 0;
    }

    _createClass(ProductionLine, {
        cars: {
            get: function () {
                return this._cars;
                //var cars = [];
                //for( var p in this._cars) {
                //    if(this._cars.hasOwnProperty(p)) {
                //        cars.push(this._cars[p]);
                //    }
                //}
                //return cars;
            }
        },
        totalCarCost: {
            get: function () {
                return this._totalCarCost;
            }
        },
        addCar: {
            value: function addCar(id, car) {
                this._cars[id] = car;
                this.calculateTotalCarCost();
            }
        },
        getCar: {
            value: function getCar(id) {
                return this._cars[id];
            }
        },
        removeCar: {
            value: function removeCar(id) {
                delete this._cars[id];
                this.calculateTotalCarCost();
            }
        },
        calculateTotalCarCost: {
            value: function calculateTotalCarCost() {
                var totalCarCost = 0;
                for (var p in this._cars) {
                    if (this._cars.hasOwnProperty(p)) {
                        totalCarCost += this._cars[p].cost;
                    }
                }
                this._totalCarCost = totalCarCost;
            }
        }
    });

    return ProductionLine;
})();

var Car = (function () {
    function Car(modelId, type) {
        _classCallCheck(this, Car);

        this._modelId = modelId;
        this._type = type;
        this._cost = 0;
    }

    _createClass(Car, {
        id: {
            get: function () {
                return this._modelId;
            }
        },
        type: {
            get: function () {
                return this._type;
            }
        },
        cost: {
            get: function () {
                return this._cost;
            },
            set: function (value) {
                this._cost = value;
            }
        },
        hasEngineUpgrade: {
            get: function () {
                return this._hasEngineUpgrade;
            },
            set: function (value) {
                this._hasEngineUpgrade = value;
            }
        },
        hasSunroof: {
            get: function () {
                return this._hasSunroof;
            },
            set: function (value) {
                this._hasSunroof = value;
            }
        },
        calculateCost: {
            value: function calculateCost() {
                var cost = 100;
                if (this.hasEngineUpgrade) {
                    cost += 10;
                }
                if (this.hasSunroof) {
                    cost += 2;
                }
                this._cost = cost;
            }
        }
    });

    return Car;
})();

var ProductionLineEventProcessor = (function (_esp$model$DisposableBase) {
    function ProductionLineEventProcessor(modelId, router) {
        _classCallCheck(this, ProductionLineEventProcessor);

        _get(Object.getPrototypeOf(ProductionLineEventProcessor.prototype), "constructor", this).call(this);
        this._modelId = modelId;
        this._router = router;
        this._carEventProcessors = {};
        this._carModelIdGenerator = (function () {
            var id = 1;
            return function () {
                return "carId_" + id++;
            };
        })();
    }

    _inherits(ProductionLineEventProcessor, _esp$model$DisposableBase);

    _createClass(ProductionLineEventProcessor, {
        observeEvents: {
            value: function observeEvents() {
                this._observeAddCarEvent();
                this._observeRemoveCarEvent();
                this._observeChildModelChanges();
            }
        },
        _observeAddCarEvent: {
            value: function _observeAddCarEvent() {
                var _this = this;

                this.addDisposable(this._router.getEventObservable("productionLineId", "addCar").observe(function (model, event) {
                    var carModelId = _this._carModelIdGenerator();
                    var carEventProcessor = new CarEventProcessor(carModelId, _this._router);
                    _this._carEventProcessors[carModelId] = carEventProcessor;
                    var car = new Car(carModelId, event.type);
                    model.addCar(carModelId, car);
                    carEventProcessor.observeEvents();
                    _this._router.addChildModel("productionLineId", carModelId, car);
                }));
            }
        },
        _observeRemoveCarEvent: {
            value: function _observeRemoveCarEvent() {
                var _this = this;

                this.addDisposable(this._router.getEventObservable("productionLineId", "removeCar").observe(function (model, event) {
                    var processor = _this._carEventProcessors[event.carModelId];
                    processor.dispose();
                    delete _this._carEventProcessors[event.carModelId];
                    _this._router.removeModel(event.carModelId);
                    model.removeCar(event.carModelId);
                }));
            }
        },
        _observeChildModelChanges: {
            value: function _observeChildModelChanges() {
                this.addDisposable(this._router.getEventObservable("productionLineId", "modelChangedEvent").observe(function (model, event) {
                    // if the car became defective call some service
                    var changedCar = model.getCar(event.childModelId);
                    console.log("car %s changed. Calculating costs", changedCar.type);
                    model.calculateTotalCarCost();
                }));
            }
        }
    });

    return ProductionLineEventProcessor;
})(esp.model.DisposableBase);

var CarEventProcessor = (function (_esp$model$DisposableBase2) {
    function CarEventProcessor(modelId, router) {
        _classCallCheck(this, CarEventProcessor);

        _get(Object.getPrototypeOf(CarEventProcessor.prototype), "constructor", this).call(this);
        this._modelId = modelId;
        this._router = router;
    }

    _inherits(CarEventProcessor, _esp$model$DisposableBase2);

    _createClass(CarEventProcessor, {
        observeEvents: {
            value: function observeEvents() {
                this.addDisposable(this._router.getEventObservable(this._modelId, "modifySpecsEvent").observe(function (model, event) {
                    console.log("processing modifySpecsEvent [%s]", JSON.stringify(event));
                    if (event.hasEngineUpgrade) {
                        model.hasEngineUpgrade = event.hasEngineUpgrade;
                    }
                    if (event.hasSunroof) {
                        model.hasSunroof = event.hasSunroof;
                    }
                    model.calculateCost();
                }));
            }
        }
    });

    return CarEventProcessor;
})(esp.model.DisposableBase);

var ProductionLineController = (function (_esp$model$DisposableBase3) {
    function ProductionLineController(productionLineId, router) {
        _classCallCheck(this, ProductionLineController);

        _get(Object.getPrototypeOf(ProductionLineController.prototype), "constructor", this).call(this);
        this._productionLineId = productionLineId;
        this._router = router;
        this._carControllers = {};
    }

    _inherits(ProductionLineController, _esp$model$DisposableBase3);

    _createClass(ProductionLineController, {
        start: {
            value: function start() {
                this.addDisposable(router.getModelObservable(this._productionLineId).observe(function (model) {
                    console.log("Model update received. Total car cost: %s", model.totalCarCost);
                }));
            }
        },
        addCar: {
            value: function addCar(type) {
                console.log("Adding %s ----------", type);
                this._router.publishEvent(this._productionLineId, "addCar", { type: type });
            }
        },
        removedCar: {
            value: function removedCar(carId) {
                console.log("Removing %s ----------", type);
                router.publishEvent(this._productionLineId, "removeCar", { carModelId: carId });
            }
        }
    });

    return ProductionLineController;
})(esp.model.DisposableBase);

var CarController = (function (_esp$model$DisposableBase4) {
    function CarController(carId, router) {
        _classCallCheck(this, CarController);

        _get(Object.getPrototypeOf(CarController.prototype), "constructor", this).call(this);
        this._carId = carId;
        this._router = router;
    }

    _inherits(CarController, _esp$model$DisposableBase4);

    _createClass(CarController, {
        start: {
            value: function start() {
                var _this = this;

                this.addDisposable(router.getModelObservable(this._carId).observe(function (model) {
                    console.log("Car %s model update received.", _this._carId);
                }));
            }
        },
        upgradEngine: {
            value: function upgradEngine() {
                console.log("Upgrading engine on car %s ----------", this._carId);
                router.publishEvent(this._carId, "modifySpecsEvent", { hasEngineUpgrade: true });
            }
        },
        addSunroof: {
            value: function addSunroof() {
                console.log("Addding sunroof to %s ----------", this._carId);
                router.publishEvent(this._carId, "modifySpecsEvent", { hasSunRoof: true });
            }
        }
    });

    return CarController;
})(esp.model.DisposableBase);

var router = new esp.Router();
router.registerModel("productionLineId", new ProductionLine());
var productionLineEventProcessor = new ProductionLineEventProcessor("productionLineId", router);
productionLineEventProcessor.observeEvents();

var productionLineController = new ProductionLineController("productionLineId", router);
productionLineController.start();

productionLineController.addCar("BMW");

console.log("Adding BMW ----------");
router.publishEvent("productionLineId", "addCar", { type: "BMW" });
router.publishEvent("carId_1", "modifySpecsEvent", { hasEngineUpgrade: true });
router.publishEvent("productionLineId", "removeCar", { carModelId: "carId_1" });
console.log();

console.log("Adding AUDI----------");
router.publishEvent("productionLineId", "addCar", { type: "AUDI" });
router.publishEvent("carId_2", "modifySpecsEvent", { hasEngineUpgrade: true });
console.log();

console.log("Adding HOLDEN----------");
router.publishEvent("productionLineId", "addCar", { type: "HOLDEN" });
router.publishEvent("carId_3", "modifySpecsEvent", { hasSunRoof: true });