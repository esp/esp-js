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

import esp from 'esp-js';
import prompt from 'prompt';

////////////////////////////////////////////////////////////// basic usage example //////////////////////////////////////////////////////////////
var runBasicExample =  () => {

    // Create a simple model
    class Car {
        constructor() {
            this._make = 'Unknown';
            this._color = 'white';
            this._isSportModel = false;
            this._description = '';
            this._price = 0;
        }
        get make() {
            return this._make;
        }
        set make(value) {
            this._make = value;
        }
        get color() {
            return this._color;
        }
        set color(value) {
            this._color = value;
        }
        get isSportModel() {
            return this._isSportModel;
        }
        set isSportModel(value) {
            this._isSportModel = value;
        }
        get description() {
            return this._description;
        }
        set description(value) {
            this._description = value;
        }
        get price() {
            return this._price;
        }
        set price(value) {
            this._price = value;
        }
    }

    // Create an event processor and observe events
    class CarEventProcessor {
        constructor(router) {
            this._router = router;
        }
        start() {
            this._listenForCarMakeChangedEvent();
            this._listenForIsSportModelChangedEvent();
            this._listenForColorModelChangedEvent();
        }
        _listenForCarMakeChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'carMakeChangedEvent')
                .subscribe((event, eventContext, model)=> {
                    model.make = event.make;
                });
        }
        _listenForIsSportModelChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'isSportModelChangedEvent')
                .subscribe((event, eventContext, model) => {
                    model.isSportModel = event.isSportModel;
                    if(model.isSportModel) {
                        model.cost = 30000;
                    } else {
                        model.cost = 20000;
                    }
                });
        }
        _listenForColorModelChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'colorChangedEvent')
                .subscribe((event, eventContext, model) => {
                    model.color = event.color;
                });
        }
    }

    // create a post event processor to do some aggregate computations
    class CarPostEventProcessor {
        process(model, event, eventContext) {
            this._updatePrice(model);
            this._updateDescription(model);
        }
        _updatePrice(model) {
            var price = 10000; // base price
            if(model.make === 'BMW') price += 20000;
            if(model.isSportModel) price += 10000;
            model.price = price;
        }
        _updateDescription(model) {
            model.description =
                "Your new " +
                (model.isSportModel ? "sporty " : "standard ") +
                "edition " +
                model.make +
                " (" + model.color + ") " +
                "will cost £" +
                model.price;
        }
    }

    // Create an event raiser and publish an event
    class CarScreenController {
        constructor(router) {
            this._router = router;
        }
        start() {
            this._listenForModelChanges();

            console.log("Simulating some user actions over 4 seconds: ");
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'carMakeChangedEvent', { make: 'BMW' });
            }, 0);
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'isSportModelChangedEvent', { isSportModel: true });
            }, 2000);
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'colorChangedEvent', { color: 'blue' });
            }, 2000);
        }
        _listenForModelChanges() {
            this._router
                .getModelObservable('myModelId')
                .subscribe(model => {
                    // you'd sync your view here, for now just dump the description to the console
                    console.log(model.description);
                });
        }
    }

    // Kick it all off
    var router = new esp.Router();
    router.addModel('myModelId', new Car(), { postEventProcessor : new CarPostEventProcessor() });

    var carEventProcessor = new CarEventProcessor(router);
    var carScreenController = new CarScreenController(router);
    carEventProcessor.start();
    carScreenController.start();

};
////////////////////////////////////////////////////////////// event workflow examples //////////////////////////////////////////////////////////////
var runEventWorkflowExample = () => {

    class FruitStore {
        constructor() {
            this._hasExpired = false;
            this._stockCount = 10;
            this._shouldRefreshFromStore = false;
            this._shouldRecalculateInventory = false;
            this._version = 0;
        }
        get version() {
            return this._version;
        }
        set version(value) {
            this._version = value;
        }
        get hasExpired() {
            return this._hasExpired;
        }
        set hasExpired(value) {
            this._hasExpired = value;
        }
        get stockCount() {
            return this._stockCount;
        }
        set stockCount(value) {
            this._stockCount = value;
        }
        get shouldRefreshFromStore() {
            return this._shouldRefreshFromStore;
        }
        set shouldRefreshFromStore(value) {
            this._shouldRefreshFromStore = value;
        }
        get shouldRecalculateInventory() {
            return this._shouldRecalculateInventory;
        }
        set shouldRecalculateInventory(value) {
            this._shouldRecalculateInventory = value;
        }
        toString() {
            return "Stock count: " + this.stockCount + ", shouldRefreshFromStore: " + this.shouldRefreshFromStore + ", shouldRecalculateInventory: " + this.shouldRecalculateInventory;
        }
    }

    var preEventProcessingExample = () => {

        console.log("** pre event processor example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.addModel(
            'model1',
            store,
            {
                preEventProcessor : (model) => {
                    model.version++;
                }
            }
        );
        router.publishEvent('model1', 'noopEvent', { });
        console.log("Store version: " + store.version); // 1;
    };

    var previewStageExample = () => {

        console.log("** preview stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.addModel('model1', store);

        router
            .getEventObservable('model1', 'fruitExpiredEvent', esp.ObservationStage.normal)
            .subscribe((event, eventContext, model) => {
                console.log("Setting hasExpired to " + event);
                model.hasExpired = event;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.preview)
            .subscribe((event, eventContext, model) => {
                if(model.hasExpired) {
                    console.log("Cancelling buyFruitEvent event as all fruit has expired");
                    eventContext.cancel();
                }
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.normal)
            .subscribe((event, eventContext, model) => {
                console.log("Buying fruit, quantity: " + event.quantity);
                model.stockCount -= event.quantity;
            });

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 9"

        router.publishEvent('model1', 'fruitExpiredEvent', true);

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // still "Stock count: 9", previous event was canceled by the preview handler

        router.publishEvent('model1', 'fruitExpiredEvent', false);

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 8"
        console.log();
    };

    var normalStageExample = () => {
        console.log("** normal stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.addModel('model1', store);

        var buyFruitEventSubscription = router
            .getEventObservable('model1', 'buyFruitEvent') // i.e. stage = esp.ObservationStage.normal
            .subscribe((event, eventContext, model) => {
                console.log("Buying fruit, quantity: " + event.quantity);
                model.stockCount -= event.quantity;
            });

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log("Stock count: " + store.stockCount); // "Stock count: 9"

        buyFruitEventSubscription.dispose();

        router.publishEvent('model1', 'buyFruitEvent', false);

        console.log("Stock count: " + store.stockCount); // still "Stock count: 9", event not delivered as subscription removed
        console.log();
    };

    var committedStageExample = () => {

        console.log("** committed stage example");

        var router = new esp.Router();

        var store = new FruitStore();
        router.addModel('model1', store);

        router
            .getEventObservable('model1', 'buyFruitEvent')
            .subscribe((event, eventContext, model) => {
                console.log("Buying fruit, quantity: " + event.quantity);
                model.stockCount -= event.quantity;
                eventContext.commit();
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.committed)
            .subscribe((event, eventContext, model) => {
                // reacting to the buyFruitEvent we check if the shelf quantity requires refilling
                var shouldRefreshFromStore = model.stockCount < 3;
                console.log("Checking if we should refresh from store. Should refresh: " + shouldRefreshFromStore);
                model.shouldRefreshFromStore = shouldRefreshFromStore;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.committed)
            .subscribe((event, eventContext, model) => {
                // given we've sold something we flip a dirty flag which could be used by another
                // // periodic event to determine if we should recalculate inventory
                console.log("Flagging inventory recalculate");
                model.shouldRecalculateInventory = true;
            });

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });
        console.log(store.toString()); // Stock count: 9, shouldRefreshFromStore: false, shouldRecalculateInventory: true

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 8 });
        console.log(store.toString()); // Stock count: 1, shouldRefreshFromStore: true, shouldRecalculateInventory: true
        console.log();
    };

    preEventProcessingExample();
    previewStageExample();
    normalStageExample();
    committedStageExample();
};

////////////////////////////////////////////////////////////// model observation example //////////////////////////////////////////////////////////////
var runModelObserveExample = () => {
    var router = new esp.Router();
    router.addModel("modelId", { foo: 1 });
    router
        .getEventObservable('modelId', 'fooChanged')
        .subscribe((event, eventContext, model)=> {
            model.foo = event.newFoo;
        });
    router
        .getModelObservable('modelId')
        .subscribe(model => {
            console.log("Foo is " + model.foo);
        });
    router.publishEvent('modelId', 'fooChanged', { newFoo: 2 });
};

////////////////////////////////////////////////////////////// observable API example //////////////////////////////////////////////////////////////
var runObserveApiBasicExample = () => {

    // note there are several concerns here that would exist in different
    // objects within your architecture, they are all together here to demo the concepts.
    var router = new esp.Router();

    // add a basic model
    router.addModel(
        "modelId",
        {
            staticData:
            {
                initialised: false,
                clientMargin: 0
            },
            price: 0
        }
    );

    // create an event stream that listens for static data
    var staticDataSubscriptionDisposable = router
        .getEventObservable('modelId', 'staticDataReceivedEvent')
        .subscribe((event, eventContext, model) => {
            console.log("Static data received");
            model.staticData.initialised = true;
            model.staticData.clientMargin = event.clientMargin;
        }
    );

    // create an event stream that listens for prices
    var eventSubscriptionDisposable = router
        .getEventObservable('modelId', 'priceReceivedEvent')
        // run an action when the stream yields
        .do((event, eventContext, model) => console.log("Price received"))
        // only procure the event if the condition matches
        .where((event, eventContext, model) => model.staticData.initialised)
        .subscribe((event, eventContext, model) => {
            model.newPrice =
                event.price +
                model.staticData.clientMargin;
            console.log("Price with margin was set to " + model.newPrice);
        });

    // publish some prices, the first 2 will get ignored as the .where() waits until the
    // static data has been set on the model.
    router.publishEvent('modelId', 'priceReceivedEvent', { price: 100 });
    router.publishEvent('modelId', 'priceReceivedEvent', { price: 101 });
    router.publishEvent('modelId', 'staticDataReceivedEvent', { clientMargin: 10 });
    router.publishEvent('modelId', 'priceReceivedEvent', { price: 102 });

    // clean up code
    staticDataSubscriptionDisposable.dispose();
    eventSubscriptionDisposable.dispose();

    // this one never gets delivered as we've disposed the event subscriptions
    router.publishEvent('modelId', 'priceReceivedEvent', { price: 103 });
};

////////////////////////////////////////////////////////////// model to model communications with events example //////////////////////////////////////////////////////////////
var modelToModelCommunicationsWithEvents = () => {
    class BaseModel {
        constructor(modelId, router) {
            this.modelId = modelId;
            this.router = router;
        }
        registerWithRouter() {
            this.router.addModel(this.modelId, this);
            this.router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(router) {
            super('tradingModelId', router);
        }
        @esp.observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            this.router.publishEvent('pricingModelId', 'priceRequested', { symbol:priceRequestEvent.symbol, replyTo:this.modelId });
        }
        @esp.observeEvent('priceReceived')
        _onPriceReceived(priceEvent) {
            console.log(`TradingModel: Price received: ${priceEvent.symbol} - ${priceEvent.bid} - ${priceEvent.ask}`);
        }
    }

    class PricingModel extends BaseModel {
        constructor(router) {
            super('pricingModelId', router);
        }
        @esp.observeEvent('priceRequested')
        _onPriceRequested(priceRequestedEvent) {
            console.log(`PricingModel: price request received, responding with last price`);
            this.router.publishEvent(priceRequestedEvent.replyTo, 'priceReceived', { symbol:priceRequestedEvent.symbol, bid:1, ask:2 });
        }
    }

    var router = new esp.Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with runAction example //////////////////////////////////////////////////////////////
var modelToModelCommunicationsWithRunAction = () => {
    class BaseModel {
        constructor(modelId, router) {
            this.modelId = modelId;
            this.router = router;
        }
        registerWithRouter() {
            this.router.addModel(this.modelId, this);
            this.router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(router, pricingModel) {
            super('tradingModelId', router);
            this._pricingModel = pricingModel;
        }
        @esp.observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            this._pricingModel.onPriceRequested({ symbol:priceRequestEvent.symbol, replyTo:this.modelId });
        }
        @esp.observeEvent('priceReceived')
        _onPriceReceived(priceEvent) {
            console.log(`TradingModel: Price received: ${priceEvent.symbol} - ${priceEvent.bid} - ${priceEvent.ask}`);
        }
    }

    class PricingModel extends BaseModel {
        constructor(router) {
            super('pricingModelId', router);
        }
        onPriceRequested(priceRequest) {
            this.router.runAction(this.modelId, () => {
                console.log(`PricingModel: price request received, responding with last price`);
                this.router.publishEvent(priceRequest.replyTo, 'priceReceived', { symbol:priceRequest.symbol, bid:1, ask:2 });
            });
        }
    }

    var router = new esp.Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router, pricingModel);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with observables (Unique Request -> Many Responses) example /////////////////////////
var modelToModelCommunicationsWithObservables1 = () => {
    class BaseModel {
        constructor(modelId, router) {
            this.modelId = modelId;
            this.router = router;
        }
        registerWithRouter() {
            this.router.addModel(this.modelId, this);
            this.router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(router, pricingModel) {
            super('tradingModelId', router);
            this._pricingModel = pricingModel;
            this.lastPrice = null;
        }
        @esp.observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            // subscribe to another models observable stream.
            let subscription = this._pricingModel
                .getPriceStream({ symbol:priceRequestEvent.symbol})
                // streamFor : ensure our observable stream yields on the dispatch loop for this model
                .streamFor(this.modelId)
                .subscribe(price => {
                    let isOnCorrectDispatchLoop = this.router.isOnDispatchLoopFor(this.modelId);
                    console.log(`TradingModel: Price received: ${price.symbol} - ${price.bid} - ${price.ask}. On correct dispatch loop: ${isOnCorrectDispatchLoop}`);
                    // Store the last price so the/a view can pick it up.
                    // Given we're on the dispatch loop for this model, the router will be pushing the model to observers after this function ends.
                    this.lastPrice = price;
                });
            // later : subscription.dispose();
        }
    }

    class PricingModel extends BaseModel {
        constructor(router) {
            super('pricingModelId', router);
        }
        getPriceStream(priceRequest) {
            return this.router.createObservableFor(this.modelId, observer => {
                // This gets invoked when the caller subscribes to the observable stream.
                // Typically you'd wire the observer up to some async service and push updates to it
                let isOnCorrectDispatchLoop = this.router.isOnDispatchLoopFor(this.modelId);
                console.log(`PricingModel: price request received, responding with last price. On correct dispatch loop: ${isOnCorrectDispatchLoop}`);
                observer.onNext({ symbol:priceRequest.symbol, bid:1, ask:2 });
                observer.onNext({ symbol:priceRequest.symbol, bid:1.1, ask:2.1 });
                return () => {
                    // Gets invoked when the caller disposes the subscription.
                    // Typically you'd un-wire the observer from any local state
                };
            });
        }
    }

    var router = new esp.Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router, pricingModel);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with observables (streaming) example /////////////////////////
var modelToModelCommunicationsWithObservables2 = () => {
    class BaseModel {
        constructor(modelId, router) {
            this.modelId = modelId;
            this.router = router;
        }
        registerWithRouter() {
            this.router.addModel(this.modelId, this);
            this.router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(router, pricingModel) {
            super('tradingModelId', router);
            this._pricingModel = pricingModel;
            this._currentSymbol = 'EURUSD';
            this.lastPrice = null;
        }
        registerWithRouter() {
            super.registerWithRouter();
            this._observePriceStream();
        }
        _observePriceStream() {
            let subscription = this._pricingModel.priceStream
                .streamFor(this.modelId)
                .where(price => price.symbol === this._currentSymbol)
                .subscribe(price => {
                    let isOnCorrectDispatchLoop = this.router.isOnDispatchLoopFor(this.modelId);
                    console.log(`TradingModel: Price received: ${price.symbol} - ${price.bid} - ${price.ask}. On correct dispatch loop: ${isOnCorrectDispatchLoop}`);
                    this.lastPrice = price;
                });
            // later, when the model is destroyed : subscription.dispose();
        }
        @esp.observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            this._currentSymbol = priceRequestEvent.symbol;
        }
    }

    class PricingModel extends BaseModel {
        constructor(router) {
            super('pricingModelId', router);
            this._priceSubject = router.createSubject();
        }
        get priceStream() {
            // Expose our internal price stream.
            // `asRouterObservable()` wraps the subject hiding functions such as onNext from consumers
            return this._priceSubject.asRouterObservable();
        }
        // expose a function so we can push prices, in a real app
        // this model would own interactions with downstream objects, receive prices and push them internally
        pushPrice(price){
            this._priceSubject.onNext(price);
        }
    }

    var router = new esp.Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router, pricingModel);
    tradingModel.registerWithRouter();

    console.log(`Prices received from network`);
    pricingModel.pushPrice({ symbol:'EURUSD', bid:1, ask:2 });
    pricingModel.pushPrice({ symbol:'USDJPY', bid:3, ask:4 });
    console.log(`User changed symbol to USDJPY`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'USDJPY'});
    console.log(`More prices received from network`);
    pricingModel.pushPrice({ symbol:'USDJPY', bid:5, ask:6 });
};

////////////////////////////////////////////////////////////// async operation with workitem //////////////////////////////////////////////////////////////
var runAcyncOperationWithWorkItemExample = () => {

    class GetUserStaticDataWorkItem extends esp.DisposableBase {
        constructor(router) {
            super();
            this._router = router;
        }
        start() {
            setTimeout(() => {
                console.log("Sending results event for StaticDataA");
                this._router.publishEvent('modelId', 'userStaticReceivedEvent', "StaticDataA");
            }, 1000);
            setTimeout(() => {
                console.log("Sending results event for StaticDataB");
                this._router.publishEvent('modelId', 'userStaticReceivedEvent', "StaticDataB");
            }, 2000);
        }
    }

    class StaticDataEventProcessor extends esp.DisposableBase {
        constructor(router) {
            super();
            this._router = router;
        }
        initialise() {
            this._listenForInitialiseEvent();
            this._listenForStaticDataReceivedEvent();
        }
        _listenForInitialiseEvent() {
            this.addDisposable(this._router
                .getEventObservable('modelId', 'initialiseEvent')
                .take(1)
                .subscribe(() => {
                    console.log("Starting work item to get static data");
                    var getUserStaticWorkItem = new GetUserStaticDataWorkItem(this._router);
                    this.addDisposable(getUserStaticWorkItem);
                    getUserStaticWorkItem.start();
                })
            );
        }
        _listenForStaticDataReceivedEvent() {
            // note you could wire up more advanced disposal of this stream (i.e. write
            // a .takeUntilInclusive() extension method, you could also leave it
            // open if you were to later expect events matching its eventType
            this.addDisposable(this._router
                .getEventObservable('modelId', 'userStaticReceivedEvent')
                .subscribe((event, eventContext, model) => {
                    console.log("Adding static data [" + event + "] to model");
                    model.staticData.push(event);
                })
            );
        }
    }

    var router = new esp.Router();
    router.addModel("modelId", { staticData:[]});
    var staticDataEventProcessor = new StaticDataEventProcessor(router);
    staticDataEventProcessor.initialise();
    console.log("Sending initialiseEvent");
    router.publishEvent('modelId', 'initialiseEvent', {});
};

////////////////////////////////////////////////////////////// async operation with runAction //////////////////////////////////////////////////////////////
var runAcyncOperationWithRunActionExample = () => {
    var myModel = {
        foo:0,
        backgroundOperations: 0
    };
    var router = new esp.Router();
    router.addModel('myModelId', myModel);
    router.getEventObservable('myModelId', 'getAsyncDataEvent').subscribe((e, c, m) => {
        console.log('About to do async work');
        m.backgroundOperations++;
        setTimeout(() => {
            router.runAction('myModelId', m2 => { // you could close over m here if you prefer
                m2.backgroundOperations--;
                console.log('Async work received. Updating model');
                m2.foo = 1;
            });
        }, 2000);
    });
    router.publishEvent('myModelId', 'getAsyncDataEvent', { request: "someRequest" });
    router.getModelObservable('myModelId').subscribe(m => {
        console.log('Update, background operation count is: %s. foo is %s', m.backgroundOperations, m.foo);
    });
};

////////////////////////////////////////////////////////////// SingleModelRouter example //////////////////////////////////////////////////////////////
var runModelRouter = () => {
    var myModel = {
        foo:0
    };
    var router = new esp.Router();
    router.addModel('myModel', myModel);
    var modelRouter = router.createModelRouter('myModel');

    modelRouter.getEventObservable('fooEvent').subscribe((e, c, m) => {
        m.foo = e.theFoo;
    });
    modelRouter.getModelObservable().subscribe(m => {
        console.log('Update, foo is: %s', m.foo);
    });
    modelRouter.publishEvent('fooEvent', { theFoo: 1});
    modelRouter.publishEvent('fooEvent', { theFoo: 2});
};


////////////////////////////////////////////////////////////// error flows example //////////////////////////////////////////////////////////////
var runErrorFlowsExample = () => {
    var router = new esp.Router();
    router.addModel("modelId", { });
    router
        .getEventObservable('modelId', 'boomEvent')
        .do(() => {throw new Error("Boom");})
        .subscribe(
            () => {
                console.log("This never run");
            }
        );
    try {
        router.publishEvent('modelId', 'boomEvent', {});
    } catch(err) {
        console.log("Error caught: " + err.message);
    }
    // this won't make it to any observers as the router is halted
    try {
        router.publishEvent('modelId', 'boomEvent', {});
    } catch(err) {
        console.log("Error caught 2: " + err.message);
    }
};

///////////////////////// example bootstrap code /////////////////
// Call one of the functions above via the prompt setup below
//////////////////////////////////////////////////////////////////

var examples = {
    "1" : { description : "Basic Example", action : runBasicExample },
    "2" : { description : "Event Workflow", action : runEventWorkflowExample },
    "3" : { description : "Model Observe", action : runModelObserveExample },
    "4" : { description : "Observable Api", action : runObserveApiBasicExample },
    "5" : { description : "Model to model communications with events", action : modelToModelCommunicationsWithEvents },
    "6" : { description : "Model to model communications with runAction", action : modelToModelCommunicationsWithRunAction },
    "7" : { description : "Model to model communications with observables (Unique Request -> Many Responses)", action : modelToModelCommunicationsWithObservables1 },
    "8" : { description : "Model to model communications with observables (streaming)", action : modelToModelCommunicationsWithObservables2 },
    "9" : { description : "Async operation with work item", action : runAcyncOperationWithWorkItemExample },
    "10" : { description : "Async operation with run action", action : runAcyncOperationWithRunActionExample},
    "11" : { description : "Single model routers", action : runModelRouter },
    "12" : { description : "Error flows example", action : runErrorFlowsExample }
};

console.log('Which sample do you want to run (enter a number)?');
for (let exampleKey in examples) {
    if (examples.hasOwnProperty(exampleKey)) {
        console.log('%s - %s', exampleKey, examples[exampleKey].description);
    }
}

var properties = [
    {
        name: 'sampleNumber',
        validator: /^[1-9]$/,
        warning: 'Sample number must be a number between 1-7 inclusive'
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) { return onErr(err); }
    var example = examples[result.sampleNumber];
    console.log('Running sample \'%s\'', example.description);
    examples[result.sampleNumber].action();
});

function onErr(err) {
    console.log(err);
    return 1;
}