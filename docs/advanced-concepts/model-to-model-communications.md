# Model To Model Communications

The esp `Router` supports multiple models. 
Often these model need to communicate with one another and when they do it's important to remember that any change to a models state should happen on that models [dispatch loop](../router-api/dispatch-loop.md). 
There are a few different options available and we'll work from the least preferable to most.

You can find the code below with the [AIP example](../../examples/api/README.md).

Note that all models on this page use this base, lets just drop that here so we're not repeating ourselves :
``` js
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
```

Not much going on here other than having a common place the models can register themselves with the `router`, and instruct the `router` to wire up any esp decorators used for event observation.  

## Option 1 - Directly mutating state (don't do this) 
If model A takes a dependency on model B, i.e. a hard reference, then model A can just directly call methods and set properties on model B. 
The direct reference isn't an anti-pattern, however if an external caller updates a models state there is no way for the `Router` to know that state has changed. 
This means there is no way the `Router` can run the [event workflow](./complete-event-workflow.md) or notify [model observers](../router-api/model-observation.md) when the workflow is done.
  
## Option 2 - By publishing events
A reasonable approach to communicate with another model is by simply publishing an event to it. 

Below we see this in action. 
`TradingModel` has an implicit dependency on `PricingModel`, it publish an event to it and passes a `replyTo` model ID.
This enables `PricingModel` to send a response event. 
As we're publishing events we're garenteed to be on the right dispatch loop for the model in question.
This allows the `Router` to run the [event workflow](./complete-event-workflow.md) and to notify [model observers](../router-api/model-observation.md) (if any). 
 
``` js
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
```

Output:

```
User requesting price for EURUSD
TradingModel: User requested price, sending request to pricing model
PricingModel: price request received, responding with last price
TradingModel: Price received: EURUSD - 1 - 2
```

While this works, implicit relationships aren't great. 
Notice how the `TradingModel` knows about the `PricingModel` ID. 
You'll need to lift you're model IDs into a const file to enable the inter model communications.

## Option 3 - Using `router.runAction()`
We can improve on the above by doing 2 things:

1. Making the models explicitly related:
 
    If you have dependent models then it's logical for a parent to either take the dependant via is't constructor or create it themselves.
    If you have a large app you may even use a container to hold and resolve instances at runtime.

2. Using `router.runAction(modelId, action)` rather than publishing events:
 
    `runAction()` is similar to publishing an event, difference being you're actually publishing a function to be run on the dispatch loop for the model in question. 
    The idea is to update local model state when the function is run. 
    It's also handy when dealing with results from [async calls](./asynchronous-operations.md) as you can simply inline the code all into a single coherent method.
  
Lets re-work our first example with this new knowledge.

```js
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
```

Output: 
```
User requesting price for EURUSD
TradingModel: User requested price, sending request to pricing model
PricingModel: price request received, responding with last price
TradingModel: Price received: EURUSD - 1 - 2
```  

Things are starting to look better. 
We've got rid of the implicit dependency, object dependencies are now obvious and statically represented.
We've also got rid of some model id passing, the `TradingModel` now just calls a function on the `PricingModel` to kick off the request.
If you're just doing one way first-and-forget, i.e. call a method and expect no results, then `runAction()` is all you need.
If you have more complex streaming dependencies, i.e. need to send *n* responses or shared streams of data, then you can use observables. 

## Option 4 - Using Observables
The ESP `Router` dispatches events and model updates using a reactive API.
If you're using [decorators](./auto-event-observation.md) to observe your events (as we are in these examples) you're somewhat hidden from that. 
However it's full power is there and can be used for model to model communications.
Via the reactive API you can ensure you're on the correct dispatch loop. 
 
The `Router` has 2 methods `router.createObservableFor()` and `router.createSubject()` which can be used for requests that receive many notifications, or simply for hooking onto a shared notification stream. 

### Unique Request -> Many Responses with `router.createObservableFor(modelId)`
It's often the case that one model needs to get a custom stream of updates from another model. 
For example: provide a request that outlines what's needed, then receive a stream of updates.
Stopping that stream, and unhooking the observer needs to be handled by the API too.

Lets again improve on our example using ESP observables.

```js
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
```

Output: 

```
User requesting price for EURUSD
TradingModel: User requested price, sending request to pricing model
PricingModel: price request received, responding with last price. On correct dispatch loop: true
TradingModel: Price received: EURUSD - 1 - 2. On correct dispatch loop: true
TradingModel: Price received: EURUSD - 1.1 - 2.1. On correct dispatch loop: true
```  

We've negated the need to pass model IDs to unrelated models. 
Models communicate to other models directly using a fit-for-purpose streaming API. 
The API allows for the child model to act when the callers subscribes, when an update needs to be pushed, and again when the caller disposes the subscription.
The API takes car of ensuring you're on the correct dispatch loop thus allowing the [event workflow](./complete-event-workflow.md) to run and [model observers](../router-api/model-observation.md) (if any) to be notified.

In the above example every caller to `PricingModel.getPriceStream()` gets a unique stream, internally it's up to `PricingModel` to deal with the provided observer how it sees fit. 
It could wire the observer up to an RX or ESP subject, or cache the observers and invoke them in a `for` loop when some downstream service yields a result that needs to be passed on.

> ##### Note
> If you've used [rxjs](https://github.com/Reactive-Extensions/RxJS) the feel of this AIP will be very familiar.
> Under the covers however the implementation doesn't use RX for reasons discussed [here](./reactive-api.md#reactive-api-why-not-rx). 

### Shared Stream
Sometimes you just want to hook onto a 'fat pipe' of notifications. 
Regardless of the caller you get the same pipe, if the caller want's it can filter using `.where(item -> boolean)`, or take a number of items using `.take(number)`. 
Lets re-work our example for one last time and assume all prices get pushed down a share stream.

```js
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
```

Output:
 
```
Prices received from network
TradingModel: Price received: EURUSD - 1 - 2. On correct dispatch loop: true
User changed symbol to USDJPY
More prices received from network
TradingModel: Price received: USDJPY - 5 - 6. On correct dispatch loop: true
```

Here we use an esp `RouterSubject` returned from `router.createSubject()`. 
This subject enables multiple observers to subscribe to the same stream of updates and receive notifications on their own dispatch loops using `streamFor(modelId)`.
Subjects are ideal when a model needs to expose a shared stream of notifications and that model owns procurement of the notification. 
Internally such a model might speak to multiple downstream services, consolidate the data, and push updates via the subject to anyone that's observing it. 
Observers can subscribe, filter and un-subscribe as needed.

## Lets Wrap it up
ESP give you multiple means to communicate between models. 
In doing so it's important to ensure that when updating local model state you're on the correct dispatch loop for that model, the observable API is built to help you do this.
Typically for fire-and-forget calls and `void` function invocations, the model you're invoking will use `runAction` to jump onto it's dispatch loop and update local state.
For specific streaming operations, the model you're invoking would use `router.createObservableFor(modelId)` and the calling model would stream the results on it's dispatch loop via `streamFor(modelId)`.
And finally, for shared streaming notifications, a model can create a subject and expose it for other models to observe, observer stream the results on the relevant dispatch loop via `streamFor(modelId)`.