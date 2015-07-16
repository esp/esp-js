"use strict";

var _interopRequire = function (obj) { return obj && obj.__esModule ? obj["default"] : obj; };

var _get = function get(object, property, receiver) { var desc = Object.getOwnPropertyDescriptor(object, property); if (desc === undefined) { var parent = Object.getPrototypeOf(object); if (parent === null) { return undefined; } else { return get(parent, property, receiver); } } else if ("value" in desc && desc.writable) { return desc.value; } else { var getter = desc.get; if (getter === undefined) { return undefined; } return getter.call(receiver); } };

var _inherits = function (subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) subClass.__proto__ = superClass; };

var _createClass = (function () { function defineProperties(target, props) { for (var key in props) { var prop = props[key]; prop.configurable = true; if (prop.value) prop.writable = true; } Object.defineProperties(target, props); } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; })();

var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

// notice_start
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
// notice_end

var esp = _interopRequire(require("../../esp.js"));

////////////////////////////////////////////////////////////// basic usage example //////////////////////////////////////////////////////////////
var runBasicExample = function () {

    // Create a simple model

    var Car = (function () {
        function Car() {
            _classCallCheck(this, Car);

            this._make = "Unknown";
            this._color = "white";
            this._isSportModel = false;
            this._description = "";
            this._price = 0;
        }

        _createClass(Car, {
            make: {
                get: function () {
                    return this._make;
                },
                set: function (value) {
                    this._make = value;
                }
            },
            color: {
                get: function () {
                    return this._color;
                },
                set: function (value) {
                    this._color = value;
                }
            },
            isSportModel: {
                get: function () {
                    return this._isSportModel;
                },
                set: function (value) {
                    this._isSportModel = value;
                }
            },
            description: {
                get: function () {
                    return this._description;
                },
                set: function (value) {
                    this._description = value;
                }
            },
            price: {
                get: function () {
                    return this._price;
                },
                set: function (value) {
                    this._price = value;
                }
            }
        });

        return Car;
    })();

    // Create an event processor and observe events

    var CarEventProcessor = (function () {
        function CarEventProcessor(router) {
            _classCallCheck(this, CarEventProcessor);

            this._router = router;
        }

        _createClass(CarEventProcessor, {
            start: {
                value: function start() {
                    this._listenForCarMakeChangedEvent();
                    this._listenForIsSportModelChangedEvent();
                    this._listenForColorModelChangedEvent();
                }
            },
            _listenForCarMakeChangedEvent: {
                value: function _listenForCarMakeChangedEvent() {
                    this._router.getEventObservable("myModelId", "carMakeChangedEvent").observe(function (model, event) {
                        model.make = event.make;
                    });
                }
            },
            _listenForIsSportModelChangedEvent: {
                value: function _listenForIsSportModelChangedEvent() {
                    this._router.getEventObservable("myModelId", "isSportModelChangedEvent").observe(function (model, event) {
                        model.isSportModel = event.isSportModel;
                        if (model.isSportModel) {
                            model.cost = 30000;
                        } else {
                            model.cost = 20000;
                        }
                    });
                }
            },
            _listenForColorModelChangedEvent: {
                value: function _listenForColorModelChangedEvent() {
                    this._router.getEventObservable("myModelId", "colorChangedEvent").observe(function (model, event) {
                        model.color = event.color;
                    });
                }
            }
        });

        return CarEventProcessor;
    })();

    // create a post event processor to do some aggregate computations

    var CarPostEventProcessor = (function () {
        function CarPostEventProcessor() {
            _classCallCheck(this, CarPostEventProcessor);
        }

        _createClass(CarPostEventProcessor, {
            process: {
                value: function process(model, event, eventContext) {
                    this._updatePrice(model);
                    this._updateDescription(model);
                }
            },
            _updatePrice: {
                value: function _updatePrice(model) {
                    var price = 10000; // base price
                    if (model.make === "BMW") price += 20000;
                    if (model.isSportModel) price += 10000;
                    model.price = price;
                }
            },
            _updateDescription: {
                value: function _updateDescription(model) {
                    model.description = "Your new " + (model.isSportModel ? "sporty " : "standard ") + "edition " + model.make + " (" + model.color + ") " + "will cost £" + model.price;
                }
            }
        });

        return CarPostEventProcessor;
    })();

    // Create an event raiser and publish an event

    var CarScreenController = (function () {
        function CarScreenController(router) {
            _classCallCheck(this, CarScreenController);

            this._router = router;
        }

        _createClass(CarScreenController, {
            start: {
                value: function start() {
                    var _this = this;

                    this._listenForModelChanges();

                    console.log("Simulating some user actions over 4 seconds: ");
                    setTimeout(function () {
                        _this._router.publishEvent("myModelId", "carMakeChangedEvent", { make: "BMW" });
                    }, 0);
                    setTimeout(function () {
                        _this._router.publishEvent("myModelId", "isSportModelChangedEvent", { isSportModel: true });
                    }, 2000);
                    setTimeout(function () {
                        _this._router.publishEvent("myModelId", "colorChangedEvent", { color: "blue" });
                    }, 2000);
                }
            },
            _listenForModelChanges: {
                value: function _listenForModelChanges() {
                    this._router.getModelObservable("myModelId").observe(function (model) {
                        // you'd sync your view here, for now just dump the description to the console
                        console.log(model.description);
                    });
                }
            }
        });

        return CarScreenController;
    })();

    // Kick it all off
    var router = new esp.Router();
    router.registerModel("myModelId", new Car(), { postEventProcessor: new CarPostEventProcessor() });

    var carEventProcessor = new CarEventProcessor(router);
    var carScreenController = new CarScreenController(router);
    carEventProcessor.start();
    carScreenController.start();
};
////////////////////////////////////////////////////////////// event workflow examples //////////////////////////////////////////////////////////////
var runEventWorkflowExample = function () {
    var FruitStore = (function () {
        function FruitStore() {
            _classCallCheck(this, FruitStore);

            this._hasExpired = false;
            this._stockCount = 10;
            this._shouldRefreshFromStore = false;
            this._shouldRecalculateInventory = false;
            this._version = 0;
        }

        _createClass(FruitStore, {
            version: {
                get: function () {
                    return this._version;
                },
                set: function (value) {
                    this._version = value;
                }
            },
            hasExpired: {
                get: function () {
                    return this._hasExpired;
                },
                set: function (value) {
                    this._hasExpired = value;
                }
            },
            stockCount: {
                get: function () {
                    return this._stockCount;
                },
                set: function (value) {
                    this._stockCount = value;
                }
            },
            shouldRefreshFromStore: {
                get: function () {
                    return this._shouldRefreshFromStore;
                },
                set: function (value) {
                    this._shouldRefreshFromStore = value;
                }
            },
            shouldRecalculateInventory: {
                get: function () {
                    return this._shouldRecalculateInventory;
                },
                set: function (value) {
                    this._shouldRecalculateInventory = value;
                }
            },
            toString: {
                value: function toString() {
                    return "Stock count: " + this.stockCount + ", shouldRefreshFromStore: " + this.shouldRefreshFromStore + ", shouldRecalculateInventory: " + this.shouldRecalculateInventory;
                }
            }
        });

        return FruitStore;
    })();

    var preEventProcessingExample = function () {

        console.log("** pre event processor example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.registerModel("model1", store, {
            preEventProcessor: function (model, event, eventContext) {
                model.version++;
            }
        });
        router.publishEvent("model1", "noopEvent", {});
        console.log("Store version: " + store.version); // 1;
    };

    var previewStageExample = function () {

        console.log("** preview stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.registerModel("model1", store);

        router.getEventObservable("model1", "fruitExpiredEvent", esp.EventStage.normal).observe(function (model, event) {
            console.log("Setting hasExpired to " + event);
            model.hasExpired = event;
        });

        router.getEventObservable("model1", "buyFruitEvent", esp.EventStage.preview).observe(function (model, event, eventContext) {
            if (model.hasExpired) {
                console.log("Cancelling buyFruitEvent event as all fruit has expired");
                eventContext.cancel();
            }
        });

        router.getEventObservable("model1", "buyFruitEvent", esp.EventStage.normal).observe(function (model, event) {
            console.log("Buying fruit, quantity: " + event.quantity);
            model.stockCount -= event.quantity;
        });

        router.publishEvent("model1", "buyFruitEvent", { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 9"

        router.publishEvent("model1", "fruitExpiredEvent", true);

        router.publishEvent("model1", "buyFruitEvent", { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // still "Stock count: 9", previous event was canceled by the preview handler

        router.publishEvent("model1", "fruitExpiredEvent", false);

        router.publishEvent("model1", "buyFruitEvent", { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 8"
        console.log();
    };

    var normalStageExample = function () {
        console.log("** normal stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.registerModel("model1", store);

        var buyFruitEventSubscription = router.getEventObservable("model1", "buyFruitEvent") // i.e. stage = esp.EventStage.normal
        .observe(function (model, event) {
            console.log("Buying fruit, quantity: " + event.quantity);
            model.stockCount -= event.quantity;
        });

        router.publishEvent("model1", "buyFruitEvent", { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 9"

        buyFruitEventSubscription.dispose();

        router.publishEvent("model1", "buyFruitEvent", false);

        console.log("Stock count: " + store.stockCount); // still "Stock count: 9", event not delivered as subscription removed
        console.log();
    };

    var committedStageExample = function () {

        console.log("** committed stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.registerModel("model1", store);

        router.getEventObservable("model1", "buyFruitEvent").observe(function (model, event, eventContext) {
            console.log("Buying fruit, quantity: " + event.quantity);
            model.stockCount -= event.quantity;
            eventContext.commit();
        });

        router.getEventObservable("model1", "buyFruitEvent", esp.EventStage.committed).observe(function (model, event) {
            // reacting to the buyFruitEvent we check if the shelf quantity requires refilling
            var shouldRefreshFromStore = model.stockCount < 3;
            console.log("Checking if we should refresh from store. Should refresh: " + shouldRefreshFromStore);
            model.shouldRefreshFromStore = shouldRefreshFromStore;
        });

        router.getEventObservable("model1", "buyFruitEvent", esp.EventStage.committed).observe(function (model, event) {
            // given we've sold something we flip a dirty flag which could be used by another
            // // periodic event to determine if we should recalculate inventory
            console.log("Flagging inventory recalculate");
            model.shouldRecalculateInventory = true;
        });

        router.publishEvent("model1", "buyFruitEvent", { quantity: 1 });
        console.log(store.toString()); // Stock count: 9, shouldRefreshFromStore: false, shouldRecalculateInventory: true

        router.publishEvent("model1", "buyFruitEvent", { quantity: 8 });
        console.log(store.toString()); // Stock count: 1, shouldRefreshFromStore: true, shouldRecalculateInventory: true
        console.log();
    };

    preEventProcessingExample();
    previewStageExample();
    normalStageExample();
    committedStageExample();
};

var runModelObserveExample = function () {
    var router = new esp.Router();
    router.registerModel("modelId", { foo: 1 });
    router.getEventObservable("modelId", "fooChanged").observe(function (model, event) {
        model.foo = event.newFoo;
    });
    router.getModelObservable("modelId").observe(function (model) {
        console.log("Foo is " + model.foo);
    });
    router.publishEvent("modelId", "fooChanged", { newFoo: 2 });
};

var runObserveApiBasicExample = function () {

    // note there are several concerns here that would exist in different
    // objects within your architecture, they are all together here to demo the concepts.
    var router = new esp.Router();

    // add a basic model
    router.registerModel("modelId", {
        staticData: {
            initialised: false,
            clientMargin: 0
        },
        price: 0
    });

    // create an event stream that listens for static data
    var staticDataSubscriptionDisposable = router.getEventObservable("modelId", "staticDataReceivedEvent").observe(function (model, event) {
        console.log("Static data received");
        model.staticData.initialised = true;
        model.staticData.clientMargin = event.clientMargin;
    });

    // create an event stream that listens for prices
    var eventSubscriptionDisposable = router.getEventObservable("modelId", "priceReceivedEvent")
    // run an action when the stream yields
    ["do"](function (model, event, eventContext) {
        return console.log("Price received");
    })
    // only procure the event if the condition matches
    .where(function (model, event, eventContext) {
        return model.staticData.initialised;
    }).observe(function (model, event, eventContext) {
        model.newPrice = event.price + model.staticData.clientMargin;
        console.log("Price with margin was set to " + model.newPrice);
    });

    // publish some prices, the first 2 will get ignored as the .where() waits until the
    // static data has been set on the model.
    router.publishEvent("modelId", "priceReceivedEvent", { price: 100 });
    router.publishEvent("modelId", "priceReceivedEvent", { price: 101 });
    router.publishEvent("modelId", "staticDataReceivedEvent", { clientMargin: 10 });
    router.publishEvent("modelId", "priceReceivedEvent", { price: 102 });

    // clean up code
    staticDataSubscriptionDisposable.dispose();
    eventSubscriptionDisposable.dispose();

    // this one never gets delivered as we've disposed the event subscriptions
    router.publishEvent("modelId", "priceReceivedEvent", { price: 103 });
};

var runErrorFlowsExample = function () {
    var router = new esp.Router();
    router.registerModel("modelId", {});
    router.getEventObservable("modelId", "boomEvent")["do"](function () {
        throw new Error("Boom");
    }).observe(function () {
        console.log("This never run");
    }, function (err) {
        console.log("Error in stream: " + err.message);
    });
    try {
        router.publishEvent("modelId", "boomEvent", {});
    } catch (err) {
        console.log("Error caught: " + err.message);
    }
    // this won't make it to any observers as the router is halted
    try {
        router.publishEvent("modelId", "boomEvent", {});
    } catch (err) {
        console.log("Error caught 2: " + err.message);
    }
};

var runAsyncWorkExample = function () {
    var router = new esp.Router();
    router.registerModel("modelId", { isBusy: false, staticData: false });
    router.getEventObservable("modelId", "initialiseEvent").beginWork(function (model, event, eventContext, onResultsReceived) {
        console.log("Getting static data async");
        model.isBusy = true;
        setTimeout(function () {
            console.log("Static returned");
            onResultsReceived({ staticData: "MyStaticData" });
        }, 1000);
    }).observe(function (model, event) {
        model.isBusy = false;
        var asyncWorkCompleteEvent = event;
        console.log("Static data received:", asyncWorkCompleteEvent.results.staticData);
    });
    router.getModelObservable("modelId").observe(function (model) {
        if (model.isBusy) {
            console.log("GUIs busy, static data: " + model.staticData);
        } else {
            console.log("GUIs idle, static data: " + model.staticData);
        }
    });
    console.log("Publishing initialiseEvent");
    router.publishEvent("modelId", "initialiseEvent", {});
    console.log("initialiseEvent published");
};

var runWorkItemExample = function () {
    var GetUserStaticDataWorkItem = (function (_esp$model$DisposableBase) {
        function GetUserStaticDataWorkItem(router) {
            _classCallCheck(this, GetUserStaticDataWorkItem);

            _get(Object.getPrototypeOf(GetUserStaticDataWorkItem.prototype), "constructor", this).call(this);
            this._router = router;
        }

        _inherits(GetUserStaticDataWorkItem, _esp$model$DisposableBase);

        _createClass(GetUserStaticDataWorkItem, {
            start: {
                value: function start() {
                    var _this = this;

                    setTimeout(function () {
                        console.log("Sending results event for StaticDataA");
                        _this._router.publishEvent("modelId", "userStaticReceivedEvent", "StaticDataA");
                    }, 1000);
                    setTimeout(function () {
                        console.log("Sending results event for StaticDataB");
                        _this._router.publishEvent("modelId", "userStaticReceivedEvent", "StaticDataB");
                    }, 2000);
                }
            }
        });

        return GetUserStaticDataWorkItem;
    })(esp.model.DisposableBase);

    var StaticDataEventProcessor = (function (_esp$model$DisposableBase2) {
        function StaticDataEventProcessor(router) {
            _classCallCheck(this, StaticDataEventProcessor);

            _get(Object.getPrototypeOf(StaticDataEventProcessor.prototype), "constructor", this).call(this);
            this._router = router;
        }

        _inherits(StaticDataEventProcessor, _esp$model$DisposableBase2);

        _createClass(StaticDataEventProcessor, {
            initialise: {
                value: function initialise() {
                    this._listenForInitialiseEvent();
                    this._listenForStaticDataReceivedEvent();
                }
            },
            _listenForInitialiseEvent: {
                value: function _listenForInitialiseEvent() {
                    var _this = this;

                    this.addDisposable(this._router.getEventObservable("modelId", "initialiseEvent").take(1).observe(function () {
                        console.log("Starting work item to get static data");
                        var getUserStaticWorkItem = new GetUserStaticDataWorkItem(_this._router);
                        _this.addDisposable(getUserStaticWorkItem);
                        getUserStaticWorkItem.start();
                    }));
                }
            },
            _listenForStaticDataReceivedEvent: {
                value: function _listenForStaticDataReceivedEvent() {
                    // note you could wire up more advanced disposal of this stream (i.e. write
                    // a .takeUntilInclusive() extension method, you could also leave it
                    // open if you were to later expect events matching its eventType
                    this.addDisposable(this._router.getEventObservable("modelId", "userStaticReceivedEvent").observe(function (model, event, eventContext) {
                        console.log("Adding static data [" + event + "] to model");
                        model.staticData.push(event);
                    }));
                }
            }
        });

        return StaticDataEventProcessor;
    })(esp.model.DisposableBase);

    var router = new esp.Router();
    router.registerModel("modelId", { staticData: [] });
    var staticDataEventProcessor = new StaticDataEventProcessor(router);
    staticDataEventProcessor.initialise();
    console.log("Sending initialiseEvent");
    router.publishEvent("modelId", "initialiseEvent", {});
};

var runModelLockUnlock = function () {
    var NumericalInput = (function (_esp$model$ModelBase) {
        function NumericalInput() {
            _classCallCheck(this, NumericalInput);

            _get(Object.getPrototypeOf(NumericalInput.prototype), "constructor", this).call(this);
            this._notional = 0;
        }

        _inherits(NumericalInput, _esp$model$ModelBase);

        _createClass(NumericalInput, {
            notional: {
                get: function () {
                    return this._notional;
                },
                set: function (value) {
                    this.ensureLocked();
                    this._notional = value;
                }
            }
        });

        return NumericalInput;
    })(esp.model.ModelBase);

    var Leg = (function (_esp$model$ModelBase2) {
        function Leg(number) {
            _classCallCheck(this, Leg);

            _get(Object.getPrototypeOf(Leg.prototype), "constructor", this).call(this);
            this._number = number;
            this._currencyPair = "";
            this._notionalField = new NumericalInput();
        }

        _inherits(Leg, _esp$model$ModelBase2);

        _createClass(Leg, {
            number: {
                get: function () {
                    return this._number;
                }
            },
            currencyPair: {
                get: function () {
                    return this._currencyPair;
                },
                set: function (value) {
                    this.ensureLocked();
                    this._currencyPair = value;
                }
            },
            notionalField: {
                get: function () {
                    return this._notionalField;
                }
            }
        });

        return Leg;
    })(esp.model.ModelBase);

    var Tile = (function (_esp$model$ModelRootBase) {
        function Tile() {
            _classCallCheck(this, Tile);

            _get(Object.getPrototypeOf(Tile.prototype), "constructor", this).call(this);
            this._leg1 = new Leg(1);
            this._leg2 = new Leg(2);
        }

        _inherits(Tile, _esp$model$ModelRootBase);

        _createClass(Tile, {
            leg1: {
                get: function () {
                    return this._leg1;
                }
            },
            leg2: {
                get: function () {
                    return this._leg2;
                }
            }
        });

        return Tile;
    })(esp.model.ModelRootBase);

    var tile = new Tile();
    // bindLockPredicate() recursively sets a predicate on all instance of ModelBase
    // that points to the model root, they can use this
    // in setters to guard against unwarranted changes,
    // if the model expands/contracts you'd have to call it again
    tile.bindLockPredicate();
    tile.lock();
    try {
        tile.leg1.notionalField.notional = 4;
    } catch (err) {
        console.log("ERROR: " + err.message);
    }
    tile.unlock();
    tile.leg1.notionalField.notional = 4;
    console.log("Notional is " + tile.leg1.notionalField.notional);
};

var runModelRouter = function () {
    var myModel = {
        foo: 0
    };
    var router = new esp.Router();
    router.registerModel("myModel", myModel);
    var modelRouter = router.createModelRouter("myModel");

    modelRouter.getEventObservable("fooEvent").observe(function (m, e) {
        m.foo = e.theFoo;
    });
    modelRouter.getModelObservable().observe(function (m) {
        console.log("Update, foo is: %s", m.foo);
    });
    modelRouter.publishEvent("fooEvent", { theFoo: 1 });
    modelRouter.publishEvent("fooEvent", { theFoo: 2 });
};
// uncomment out the example you want to run, you can uncomment them all but their results would overlap as they do things async.

// runBasicExample();
// runEventWorkflowExample();
// runModelObserveExample();
// runObserveApiBasicExample();
// runErrorFlowsExample();
// runAsyncWorkExample();
// runWorkItemExample();
// runModelLockUnlock();
runModelRouter();