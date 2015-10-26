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
                .observe((event, eventContext, model)=> {
                    model.make = event.make;
                });
        }
        _listenForIsSportModelChangedEvent() {
            this._router
                .getEventObservable('myModelId', 'isSportModelChangedEvent')
                .observe((event, eventContext, model) => {
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
                .observe((event, eventContext, model) => {
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
                .observe(model => {
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
            .observe((event, eventContext, model) => {
                console.log("Setting hasExpired to " + event);
                model.hasExpired = event;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.preview)
            .observe((event, eventContext, model) => {
                if(model.hasExpired) {
                    console.log("Cancelling buyFruitEvent event as all fruit has expired");
                    eventContext.cancel();
                }
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.normal)
            .observe((event, eventContext, model) => {
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
            .observe((event, eventContext, model) => {
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
            .observe((event, eventContext, model) => {
                console.log("Buying fruit, quantity: " + event.quantity);
                model.stockCount -= event.quantity;
                eventContext.commit();
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.committed)
            .observe((event, eventContext, model) => {
                // reacting to the buyFruitEvent we check if the shelf quantity requires refilling
                var shouldRefreshFromStore = model.stockCount < 3;
                console.log("Checking if we should refresh from store. Should refresh: " + shouldRefreshFromStore);
                model.shouldRefreshFromStore = shouldRefreshFromStore;
            });

        router
            .getEventObservable('model1', 'buyFruitEvent', esp.ObservationStage.committed)
            .observe((event, eventContext, model) => {
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

var runModelObserveExample = () => {
    var router = new esp.Router();
    router.addModel("modelId", { foo: 1 });
    router
        .getEventObservable('modelId', 'fooChanged')
        .observe((event, eventContext, model)=> {
            model.foo = event.newFoo;
        });
    router
        .getModelObservable('modelId')
        .observe(model => {
            console.log("Foo is " + model.foo);
        });
    router.publishEvent('modelId', 'fooChanged', { newFoo: 2 });
};

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
        .observe((event, eventContext, model) => {
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
        .observe((event, eventContext, model) => {
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

var runErrorFlowsExample = () => {
    var router = new esp.Router();
    router.addModel("modelId", { });
    router
        .getEventObservable('modelId', 'boomEvent')
        .do(() => {throw new Error("Boom");})
        .observe(
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

var runAcyncOperationWithWorkItemExample = () => {

    class GetUserStaticDataWorkItem extends esp.model.DisposableBase {
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

    class StaticDataEventProcessor extends esp.model.DisposableBase {
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
                .observe(() => {
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
                .observe((event, eventContext, model) => {
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

var runAcyncOperationWithRunActionExample = () => {
    var myModel = {
        foo:0,
        backgroundOperations: 0
    };
    var router = new esp.Router();
    router.addModel('myModelId', myModel);
    router.getEventObservable('myModelId', 'getAsyncDataEvent').observe((e, c, m) => {
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
    router.getModelObservable('myModelId').observe(m => {
        console.log('Update, background operation count is: %s. foo is %s', m.backgroundOperations, m.foo);
    });
};

var runModelLockUnlock = () => {
    class NumericalInput extends esp.model.ModelBase {
        constructor() {
            super();
            this._notional = 0;
        }
        get notional() {
            return this._notional;
        }
        set notional(value) {
            this.ensureLocked();
            this._notional = value;
        }
    }

    class Leg extends esp.model.ModelBase {
        constructor(number) {
            super();
            this._number = number;
            this._currencyPair = "";
            this._notionalField = new NumericalInput();
        }
        get number() {
            return this._number;
        }
        get currencyPair() {
            return this._currencyPair;
        }
        set currencyPair(value) {
            this.ensureLocked();
            this._currencyPair = value;
        }
        get notionalField() {
            return this._notionalField;
        }
    }

    class Tile extends esp.model.ModelRootBase {
        constructor() {
            super();
            this._leg1 = new Leg(1);
            this._leg2 = new Leg(2);
        }
        get leg1() {
            return this._leg1;
        }
        get leg2() {
            return this._leg2;
        }
    }

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

var runModelRouter = () => {
    var myModel = {
        foo:0
    };
    var router = new esp.Router();
    router.addModel('myModel', myModel);
    var modelRouter = router.createModelRouter('myModel');

    modelRouter.getEventObservable('fooEvent').observe((e, c, m) => {
        m.foo = e.theFoo;
    });
    modelRouter.getModelObservable().observe(m => {
        console.log('Update, foo is: %s', m.foo);
    });
    modelRouter.publishEvent('fooEvent', { theFoo: 1});
    modelRouter.publishEvent('fooEvent', { theFoo: 2});
};

///////////////////////// example bootstrap code /////////////////
// Simply calls one of the functions above via the prompt
//////////////////////////////////////////////////////////////////

var examples = {
    "1" : { description : "Basic Example", action : runBasicExample },
    "2" : { description : "Event Workflow", action : runEventWorkflowExample },
    "3" : { description : "Model Observe", action : runModelObserveExample },
    "4" : { description : "Observable Api", action : runObserveApiBasicExample },
    "5" : { description : "Error flows example", action : runErrorFlowsExample },
    "6" : { description : "Async operation with work item", action : runAcyncOperationWithWorkItemExample },
    "7" : { description : "Async operation with run action", action : runAcyncOperationWithRunActionExample},
    "8" : { description : "Model Lock/Unlock", action : runModelLockUnlock },
    "9" : { description : "Model specific routers", action : runModelRouter },
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