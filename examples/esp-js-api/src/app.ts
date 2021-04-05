// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import {Router, observeEvent, ObservationStage, EventEnvelope, RouterSubject, DisposableBase} from 'esp-js';

////////////////////////////////////////////////////////////// basic usage example //////////////////////////////////////////////////////////////
export const runBasicExample =  () => {

    // Create a simple model
    class Car {
        _make = 'Unknown';
        _color = 'white';
        _isSportModel = false;
        _description = '';
        _cost = 0;
        constructor() { }
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
        get cost() {
            return this._cost;
        }
        set cost(value) {
            this._cost = value;
        }
    }

    // Create an event processor and observe events
    class CarEventProcessor {
        constructor(private _router: Router) { }
        start() {
            this._listenForCarMakeChangedEvent();
            this._listenForIsSportModelChangedEvent();
            this._listenForColorModelChangedEvent();
        }
        _listenForCarMakeChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'carMakeChangedEvent')
                .subscribe((envelope: EventEnvelope<{make: string}, Car>)=> {
                    envelope.model.make = envelope.event.make;
                });
        }
        _listenForIsSportModelChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'isSportModelChangedEvent')
                .subscribe((envelope: EventEnvelope<{isSportModel: boolean}, Car>)=> {
                    envelope.model.isSportModel = envelope.event.isSportModel;
                    if(envelope.model.isSportModel) {
                        envelope.model.cost = 30000;
                    } else {
                        envelope.model.cost = 20000;
                    }
                });
        }
        _listenForColorModelChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'colorChangedEvent')
                .subscribe(({event, context, model}) => {
                    model.color = event.color;
                });
        }
    }

    // create a post event processor to do some aggregate computations
    const carPostEventProcessor  = (model, eventsProcessed) => {
        let price = 10000; // base price
        if (model.make === 'BMW') {
            price += 20000;
        }
        if (model.isSportModel) {
            price += 10000;
        }
        model.price = price;
        model.description =
            'Your new ' +
            (model.isSportModel ? 'sporty ' : 'standard ') +
            'edition ' +
            model.make +
            ' (' + model.color + ') ' +
            'will cost £' +
            model.price;
    };

    // Create an event raiser and publish an event
    class CarScreenController {
        constructor(private _router: Router) {
            this._router = router;
        }
        start() {
            this._listenForModelChanges();

            console.log('Simulating some user actions over 4 seconds: ');
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'carMakeChangedEvent', { make: 'BMW' });
            }, 0);
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'isSportModelChangedEvent', { isSportModel: true });
            }, 500);
            setTimeout(() => {
                this._router.publishEvent('myModelId', 'colorChangedEvent', { color: 'blue' });
            }, 1000);
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
    let router = new Router();
    router.addModel('myModelId', new Car(), { postEventProcessor : carPostEventProcessor });

    let carEventProcessor = new CarEventProcessor(router);
    let carScreenController = new CarScreenController(router);
    carEventProcessor.start();
    carScreenController.start();

};

////////////////////////////////////////////////////////////// event workflow examples //////////////////////////////////////////////////////////////
export const runEventWorkflowExample = () => {

    class FruitStore {
        _hasExpired = false;
        _stockCount = 10;
        _shouldRefreshFromStore = false;
        _shouldRecalculateInventory = false;
        _version = 0;
        constructor() { }
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
            return 'Stock count: ' + this.stockCount + ', shouldRefreshFromStore: ' + this.shouldRefreshFromStore + ', shouldRecalculateInventory: ' + this.shouldRecalculateInventory;
        }
    }

    let preEventProcessingExample = () => {

        console.log('** pre event processor example');

        let router = new Router();

        let store = new FruitStore();
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
        console.log('Store version: ' + store.version); // 1;
    };

    let previewStageExample = () => {

        console.log('** preview stage example');

        let router = new Router();

        let store = new FruitStore();
        router.addModel('model1', store);

        router
            .getEventObservable('model1', 'fruitExpiredEvent', ObservationStage.normal)
            .subscribe((envelope: EventEnvelope<boolean, FruitStore>) => {
                console.log('Setting hasExpired to ' + envelope.event);
                envelope.model.hasExpired = envelope.event;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', ObservationStage.preview)
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                if(envelope.model.hasExpired) {
                    console.log('Cancelling buyFruitEvent event as all fruit has expired');
                    envelope.context.cancel();
                }
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', ObservationStage.normal)
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                console.log('Buying fruit, quantity: ' + envelope.event.quantity);
                envelope.model.stockCount -= envelope.event.quantity;
            });

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log('Stock count: ' + store.stockCount); // 'Stock count: 9'

        router.publishEvent('model1', 'fruitExpiredEvent', true);

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log('Stock count: ' + store.stockCount); // still 'Stock count: 9', previous event was canceled by the preview handler

        router.publishEvent('model1', 'fruitExpiredEvent', false);

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log('Stock count: ' + store.stockCount); // 'Stock count: 8'
        console.log();
    };

    let normalStageExample = () => {
        console.log('** normal stage example');

        let router = new Router();

        let store = new FruitStore();
        router.addModel('model1', store);

        let buyFruitEventSubscription = router
            .getEventObservable('model1', 'buyFruitEvent') // i.e. stage = ObservationStage.normal
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                console.log('Buying fruit, quantity: ' + envelope.event.quantity);
                envelope.model.stockCount -= envelope.event.quantity;
            });

        router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

        console.log('Stock count: ' + store.stockCount); // 'Stock count: 9'

        buyFruitEventSubscription.dispose();

        router.publishEvent('model1', 'buyFruitEvent', false);

        console.log('Stock count: ' + store.stockCount); // still 'Stock count: 9', event not delivered as subscription removed
        console.log();
    };

    let committedStageExample = () => {

        console.log('** committed stage example');

        let router = new Router();

        let store = new FruitStore();
        router.addModel('model1', store);

        router
            .getEventObservable('model1', 'buyFruitEvent')
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                console.log('Buying fruit, quantity: ' + envelope.event.quantity);
                envelope.model.stockCount -= envelope.event.quantity;
                envelope.context.commit();
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', ObservationStage.committed)
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                // reacting to the buyFruitEvent we check if the shelf quantity requires refilling
                let shouldRefreshFromStore = envelope.model.stockCount < 3;
                console.log('Checking if we should refresh from store. Should refresh: ' + shouldRefreshFromStore);
                envelope.model.shouldRefreshFromStore = shouldRefreshFromStore;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', ObservationStage.committed)
            .subscribe((envelope: EventEnvelope<{quantity: number}, FruitStore>) => {
                // given we've sold something we flip a dirty flag which could be used by another
                // // periodic event to determine if we should recalculate inventory
                console.log('Flagging inventory recalculate');
                envelope.model.shouldRecalculateInventory = true;
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
export const runModelObserveExample = () => {
    let router = new Router();
    router.addModel('modelId', { foo: 1 });
    router
        .getEventObservable('modelId', 'fooChanged')
        .subscribe((envelope: EventEnvelope<{newFoo: number}, {foo: number}>) => {
            envelope.model.foo = envelope.event.newFoo;
        });
    router
        .getModelObservable('modelId')
        .subscribe(model => {
            console.log('Foo is ' + model.foo);
        });
    router.publishEvent('modelId', 'fooChanged', { newFoo: 2 });
};

////////////////////////////////////////////////////////////// observable API example //////////////////////////////////////////////////////////////
export const runObserveApiBasicExample = () => {

    interface TheModel {
        staticData: {
            initialised: boolean,
            clientMargin: number,
        };
        price: number;
    }

    // note there are several concerns here that would exist in different
    // objects within your architecture, they are all together here to demo the concepts.
    let router = new Router();

    // add a basic model
    router.addModel(
        'modelId',
        <TheModel>{
            staticData:
            {
                initialised: false,
                clientMargin: 0
            },
            price: 0
        }
    );

    // create an event stream that listens for static data
    let staticDataSubscriptionDisposable = router
        .getEventObservable('modelId', 'staticDataReceivedEvent')
        .subscribe((envelope: EventEnvelope<{clientMargin: number}, TheModel>) => {
            console.log('Static data received');
            envelope.model.staticData.initialised = true;
            envelope.model.staticData.clientMargin = envelope.event.clientMargin;
        }
    );

    // create an event stream that listens for prices
    let eventSubscriptionDisposable = router
        .getEventObservable('modelId', 'priceReceivedEvent')
        // run an action when the stream yields
        .do(() => console.log('Price received'))
        // only procure the event if the condition matches
        .filter((envelope: EventEnvelope<{price: number}, TheModel>) => envelope.model.staticData.initialised)
        .subscribe((envelope: EventEnvelope<{price: number}, TheModel>) => {
            envelope.model.price =
                envelope.event.price +
                envelope.model.staticData.clientMargin;
            console.log('Price with margin was set to ' + envelope.model.price);
        });

    // publish some prices, the first 2 will get ignored as the .filter() waits until the
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
export const runModelToModelCommunicationsWithEvents = () => {
    interface PriceRequestedEvent { symbol: string; replyTo: string; }

    interface PriceReceivedEvent { symbol: string; bid: number; ask: number; }

    class BaseModel {
        constructor(public modelId: string, protected _router: Router) {
            this.modelId = modelId;
            this._router = _router;
        }
        registerWithRouter() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(_router: Router) {
            super('tradingModelId', _router);
        }
        @observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent: PriceRequestedEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            this._router.publishEvent('pricingModelId', 'priceRequested', { symbol:priceRequestEvent.symbol, replyTo:this.modelId });
        }
        @observeEvent('priceReceived')
        _onPriceReceived(priceEvent: PriceReceivedEvent) {
            console.log(`TradingModel: Price received: ${priceEvent.symbol} - ${priceEvent.bid} - ${priceEvent.ask}`);
        }
    }

    class PricingModel extends BaseModel {
        constructor(_router: Router) {
            super('pricingModelId', _router);
        }
        @observeEvent('priceRequested')
        _onPriceRequested(priceRequestedEvent: PriceRequestedEvent) {
            console.log(`PricingModel: price request received, responding with last price`);
            this._router.publishEvent(priceRequestedEvent.replyTo, 'priceReceived', { symbol:priceRequestedEvent.symbol, bid:1, ask:2 });
        }
    }

    let router = new Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with runAction example //////////////////////////////////////////////////////////////
export const runModelToModelCommunicationsWithRunAction = () => {
    class BaseModel {
        constructor(public modelId, protected _router) { }
        registerWithRouter() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        constructor(_router, private _pricingModel) {
            super('tradingModelId', _router);
        }
        @observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            this._pricingModel.onPriceRequested({ symbol:priceRequestEvent.symbol, replyTo:this.modelId });
        }
        @observeEvent('priceReceived')
        _onPriceReceived(priceEvent) {
            console.log(`TradingModel: Price received: ${priceEvent.symbol} - ${priceEvent.bid} - ${priceEvent.ask}`);
        }
    }

    class PricingModel extends BaseModel {
        constructor(_router) {
            super('pricingModelId', _router);
        }
        onPriceRequested(priceRequest) {
            this._router.runAction(this.modelId, () => {
                console.log(`PricingModel: price request received, responding with last price`);
                this._router.publishEvent(priceRequest.replyTo, 'priceReceived', { symbol:priceRequest.symbol, bid:1, ask:2 });
            });
        }
    }

    let router = new Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router, pricingModel);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with observables (Unique Request -> Many Responses) example /////////////////////////
export const runModelToModelCommunicationsWithObservables1 = () => {
    class BaseModel {
        constructor(public modelId, protected _router) {
            this.modelId = modelId;
            this._router = _router;
        }
        registerWithRouter() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        lastPrice = null;
        constructor(_router, private _pricingModel) {
            super('tradingModelId', _router);
            this._pricingModel = _pricingModel;
        }
        @observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            console.log(`TradingModel: User requested price, sending request to pricing model`);
            // subscribe to another models observable stream.
            let subscription = this._pricingModel
                .getPriceStream({ symbol:priceRequestEvent.symbol})
                // streamFor : ensure our observable stream yields on the dispatch loop for this model
                .streamFor(this.modelId)
                .subscribe(price => {
                    let isOnCorrectDispatchLoop = this._router.isOnDispatchLoopFor(this.modelId);
                    console.log(`TradingModel: Price received: ${price.symbol} - ${price.bid} - ${price.ask}. On correct dispatch loop: ${isOnCorrectDispatchLoop}`);
                    // Store the last price so the/a view can pick it up.
                    // Given we're on the dispatch loop for this model, the router will be pushing the model to observers after this function ends.
                    this.lastPrice = price;
                });
            // later : subscription.dispose();
        }
    }

    class PricingModel extends BaseModel {
        constructor(_router: Router) {
            super('pricingModelId', _router);
        }
        getPriceStream(priceRequest) {
            return this._router.createObservableFor(this.modelId, observer => {
                // This gets invoked when the caller subscribes to the observable stream.
                // Typically you'd wire the observer up to some async service and push updates to it
                let isOnCorrectDispatchLoop = this._router.isOnDispatchLoopFor(this.modelId);
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

    let router = new Router();
    let pricingModel = new PricingModel(router);
    pricingModel.registerWithRouter();
    let tradingModel = new TradingModel(router, pricingModel);
    tradingModel.registerWithRouter();
    console.log(`User requesting price for EURUSD`);
    router.publishEvent(tradingModel.modelId, 'userRequestedPrice', { symbol: 'EURUSD'});
};

////////////////////////////////////////////////////////////// model to model communications with observables (streaming) example /////////////////////////
export const runModelToModelCommunicationsWithObservables2 = () => {
    class BaseModel {
        constructor(public modelId, protected _router) {
            this.modelId = modelId;
            this._router = _router;
        }
        registerWithRouter() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
        }
    }

    class TradingModel extends BaseModel {
        _currentSymbol = 'EURUSD';
        lastPrice = null;
        constructor(_router: Router, private _pricingModel: PricingModel) {
            super('tradingModelId', _router);
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
                .filter(price => price.symbol === this._currentSymbol)
                .subscribe(price => {
                    let isOnCorrectDispatchLoop = this._router.isOnDispatchLoopFor(this.modelId);
                    console.log(`TradingModel: Price received: ${price.symbol} - ${price.bid} - ${price.ask}. On correct dispatch loop: ${isOnCorrectDispatchLoop}`);
                    this.lastPrice = price;
                });
            // later, when the model is destroyed : subscription.dispose();
        }
        @observeEvent('userRequestedPrice')
        _onUserRequestedPrice(priceRequestEvent) {
            this._currentSymbol = priceRequestEvent.symbol;
        }
    }

    class PricingModel extends BaseModel {
        private _priceSubject: RouterSubject<any>;
        constructor(_router: Router) {
            super('pricingModelId', _router);
            this._priceSubject = _router.createSubject();
        }
        get priceStream() {
            // Expose our internal price stream.
            // `asRouterObservable()` wraps the subject hiding functions such as onNext from consumers
            return this._priceSubject.asRouterObservable(this._router);
        }
        // expose a function so we can push prices, in a real app
        // this model would own interactions with downstream objects, receive prices and push them internally
        pushPrice(price) {
            this._priceSubject.onNext(price);
        }
    }

    let router = new Router();
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
export const runAcyncOperationWithWorkItemExample = () => {

    interface StaticDataModel {
        staticData: string[];
    }

    class GetUserStaticDataWorkItem extends DisposableBase {
        constructor(private _router: Router) {
            super();
        }
        start() {
            setTimeout(() => {
                console.log('Sending results event for StaticDataA');
                this._router.publishEvent('modelId', 'userStaticReceivedEvent', 'StaticDataA');
            }, 1000);
            setTimeout(() => {
                console.log('Sending results event for StaticDataB');
                this._router.publishEvent('modelId', 'userStaticReceivedEvent', 'StaticDataB');
            }, 2000);
        }
    }

    class StaticDataEventProcessor extends DisposableBase {
        constructor(private _router: Router) {
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
                    console.log('Starting work item to get static data');
                    let getUserStaticWorkItem = new GetUserStaticDataWorkItem(this._router);
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
                .subscribe((envelope: EventEnvelope<string, StaticDataModel>) => {
                    console.log('Adding static data [' + envelope.event + '] to model');
                    envelope.model.staticData.push(envelope.event);
                })
            );
        }
    }

    let router = new Router();
    router.addModel('modelId', <StaticDataModel>{ staticData:[]});
    let staticDataEventProcessor = new StaticDataEventProcessor(router);
    staticDataEventProcessor.initialise();
    console.log('Sending initialiseEvent');
    router.publishEvent('modelId', 'initialiseEvent', {});
};

////////////////////////////////////////////////////////////// async operation with runAction //////////////////////////////////////////////////////////////
export const runAcyncOperationWithRunActionExample = () => {
    interface TestModel {
        foo: number;
        backgroundOperations: number;
    }
    let myModel: TestModel = {
        foo:0,
        backgroundOperations: 0
    };
    let router = new Router();
    router.addModel('myModelId', myModel);
    router
        .getEventObservable('myModelId', 'getAsyncDataEvent')
        .subscribe((envelope: EventEnvelope<string, TestModel>) => {
            console.log('About to do async work');
            envelope.model.backgroundOperations++;
            setTimeout(() => {
                router.runAction('myModelId', (m2: TestModel) => { // you could close over m here if you prefer
                    m2.backgroundOperations--;
                    console.log('Async work received. Updating model');
                    m2.foo = 1;
                });
            }, 2000);
        });
    router.publishEvent('myModelId', 'getAsyncDataEvent', { request: 'someRequest' });
    router.getModelObservable('myModelId').subscribe(m => {
        console.log('Update, background operation count is: %s. foo is %s', m.backgroundOperations, m.foo);
    });
};

////////////////////////////////////////////////////////////// SingleModelRouter example //////////////////////////////////////////////////////////////
export const runModelRouter = () => {
    interface TestModel {
        foo: number;
    }
    let myModel: TestModel = {
        foo:0
    };
    let router = new Router();
    router.addModel('myModel', myModel);
    let modelRouter = router.createModelRouter('myModel');

    modelRouter
        .getEventObservable('fooEvent')
        .subscribe((envelope: EventEnvelope<{ theFoo: number }, TestModel>) => {
            envelope.model.foo = envelope.event.theFoo;
        });
    modelRouter.getModelObservable().subscribe(m => {
        console.log('Update, foo is: %s', m.foo);
    });
    modelRouter.publishEvent('fooEvent', { theFoo: 1});
    modelRouter.publishEvent('fooEvent', { theFoo: 2});
};

////////////////////////////////////////////////////////////// error flows example //////////////////////////////////////////////////////////////
export const runErrorFlowsExample = () => {
    let router = new Router();
    router.addModel('modelId', { });
    router
        .getEventObservable('modelId', 'boomEvent')
        .do(() => {throw new Error('Boom');})
        .subscribe(
            () => {
                console.log('This never run');
            }
        );
    try {
        router.publishEvent('modelId', 'boomEvent', {});
    } catch(err) {
        console.log('Error caught: ' + err.message);
    }
    // this won't make it to any observers as the router is halted
    try {
        router.publishEvent('modelId', 'boomEvent', {});
    } catch(err) {
        console.log('Error caught 2: ' + err.message);
    }
};
