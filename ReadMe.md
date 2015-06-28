[![Build Status](https://travis-ci.org/esp/esp-js.svg?branch=master)](https://travis-ci.org/esp/esp-js)
[![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
[![Join the chat at https://gitter.im/esp/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/esp/chat?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

**[Installation](#installation)** |
**[Basic usage](#basic-usage)** |
**[Key concepts](#key-concepts)** |
**[Anti Patterns](#anti-patterns)** |
**[Examples](#examples)** |
**[Feature Road Map](#feature-road-map)**

# Evented State Processor (ESP)

ESP adds specific processing workflow around changes to a model's state. 
It takes ownership of a [single root model](#single-root-model).
Those interested in observing the model's state observe a stream of events from a `Router`.
Those wanting to change a model's state can publish events to the `Router`. 
The `Router` routes events to [`EventProcessors`](#event-processors) responsible for applying the new state using a [state processing workflow](#state-processing-workflow). 
Once the workflow is done, the `Router` dispatches the most recent model version to all model observers.

The [single root model](#single-root-model) allows a developer to focus on modeling the problem domain without worrying about infrastructural clutter. 
The router's [observable](#observable-api) event dispatch and [state processing workflow](#state-processing-workflow) allows a developer to compose complex state manipulation logic of smaller units which are executed in a deterministic manner.

## Symptoms that you might be looking for a state management pattern

* You are dealing with a large amount of state, complex screens with 20-200+ inputs, various workflows or maybe different representations of the same data.
* Your state shifts in real time, with the real time changes triggering complex logic that needs processing.
* You pass objects to other objects, observe these dependent objects for changes and you sync state amongst them.
* You have a deep inheritance strategy amongst your objects.
You may even mix in some strategies to further augment behaviour.
It is hard to deterministically tell where the state is and which code changes it.
* You use some form of event aggregation to send state between objects but do not have central representation of this state.
* On the GUI you've used the MV* range of patterns (MVC, MVVM, MVVMC) and have had issues managing complex state.

ESP aims to solve these problems by providing a model-centric view of all state, it provides a deterministic and ordered process for state modifications.

## Where can it be used?

ESP can be used on both client and servers, anywhere you have push-based real time state that requires modeling. 
Within your application you may have several independent areas that manage complex state, each of these could be candidates for ESP. 
* On the client it can be used to process state for a complex screen or a set of related complex screens. 
* It complements the MV* range of patterns by providing a deterministic method to modify and observe state. 
* On the server you might use it to model push-based user state and general internal server state, again it provides a deterministic method to modify and observe such state.

# Installation
Install from npm: `npm install esp-js --save`.

If you're using ES6 with a package manager such as [webpack](https://webpack.github.io) you can import `esp` like this:

```javascript
import esp from 'esp-js';
var router = new esp.Router();
```

Alternatevely you can reference `dist\esp.js` or `dist\esp.min.js` via a `script` tag. These files expose `esp` using the Universal Module Definition (UMD) format. 

# Basic usage

The complete code for this basic example can be found with the source: [app.js](src/examples/readme/app.js).

###Create a simple model

Below is a simple example of a single entity model. 
In reality you might reach hundreds of entities with the object graph many levels deep.

``` javascript
class Car {
    constructor() {
        this._make = 'Unknown';
        this._color = 'White';
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
```

### Create an event processor and observe events

Below is a basic [event processor](#event-processors) with a few event subscriptions. 
An event processor is simply something that observes events from the router and modifies the model when an event is delivered.

``` javascript
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
            .observe((model, event)=> {
                model.make = event.make;
            });
    }
    _listenForIsSportModelChangedEvent() {
        this._router
            .getEventObservable('myModelId', 'isSportModelChangedEvent')
            .observe((model, event) => {
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
            .observe((model, event) => {
                model.color = event.color;
            });
    }
}
```

### Create an event post processor

[Post processors](#PostEventProcessing) are a unit of work that always runs regardless of the event that were raised. 
Being the last stage in the [state processing workflow](#state-processing-workflow) dramatic changes to the model shouldn't be done here. 
This makes it ideal for aggregate operations. 
You could put the below logic into the above event processor. 
However if many event processors were touching the model, it is best to put such logic at the end of the workflow.
This avoids the need for previous steps to try figure out aggregate computation when the model is still a shifting target.

``` javascript
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
```

### Create an event raiser and publish some events

Many different things could impact the state of your model: perhaps a button click on the GUI, the results from an async operation or a timeout. 
On the server it might be a request from the network or new data pushed to the server from upstream services.

In this example we'll use a controller that (pretends to) receives data from a view and raise an event to the router. 
Publishing the event kicks off the router's [state processing workflow](#state-processing-workflow).

``` javascript
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
```

Note how the controller also listens for model changes as often the event raiser is also interested in the resultant model. 
For example a user may select an option from a drop down, raise the event to process it, then await a refreshed model with further data to display. 
In fact several other unrelated controllers may also be interested in this new data and they too would get it by observing the model.

###Kick it all off

Finally we wire everything up, start by creating the router, add the model using a `modelId`, the `model` and optionally an `options` object. 
`options` can contain a [`preEventprocessor`](#PreEventProcessing) and/or a [`postEventProcessor`](#PostEventProcessing).

``` javascript
var router = new esp.Router();
router.registerModel('myModelId', new Car(), { postEventProcessor : new CarPostEventProcessor() });

var carEventProcessor = new CarEventProcessor(router);
var carScreenController = new CarScreenController(router);
carEventProcessor.start();
carScreenController.start();
```

output:
```
Simulating some user actions over 4 seconds:
Your new standard edition BMW (white) will cost £30000
Your new sporty edition BMW (white) will cost £40000
Your new sporty edition BMW (blue) will cost £40000

```
This basic example completes the event processing round trip. 
Control flows into the router via an event, the router owns routing the event to the processors, then owns dispatching the modified model to observers. 
In a real world example there would be a much larger model, many event raisers, many event processors and many model observers.
Additionally full usage of the [state processing workflow](#state-processing-workflow) would allow for fine grained control of state against the model.

# Key concepts

## Single root model

A single root model is simply a single instance object hierarchy that models your system. 
The object contains little business logic as event processors own this. 
Additionally they own how the model state shifts/grows/contracts over time (more on this below). 
The root of the model obviously knows about objects below it.
However its focus is really on interacting with its direct children, and those children with their own children. 
This interaction is usually quite simplistic (i.e. indexers, lookups etc).

A model purist may say only *model what's specific to your business domain*. 
This pattern prefers the broader definition *model what's specific to your system*.
This broader definition encompasses the business domain and additional state relating to how your system currently deals with business state. 
This allows you to:

+ model version information, perhaps of the entire model or of specific nodes
+ model alert notifications that should be processed by consumers/users
+ model the holding of events that require user confirmation ('Are you sure you want to cancel?')
+ model async operations that may be in flight
+ model validation, either at a specific node or model it for the entire model
+ model the type of change the model has undergone
+ model static data that used to interpret the meaning of the model (services would feed static into the model via events)
+ model exception/error conditions

Some business logic can exist within your model objects, however (and perhaps deviating from other modeling patterns) model objects should contain little business logic.
If your model objects contains lots of business logic they soon becomes inflexible as they have to account for all possible permutations or configurations. 
Rather put the logic in [event processors](#event-processors). 
This allows for the model to remain purely descriptive and allows for event processors to be swapped in and out altering how state is applied to the model. 
The 'model' in the traditional sense now really comprises of the model objects, plus event processors, and these together model the sub-system in addition to the business domain.

> Initialise as much as possible up front - Redundant conditional logic can be avoided by initialising as much of the model up front. 
> If the various parts of the model aren't used just model them as 'disabled'. 
> Of course if the model grows and contracts you'd not initialise default values in arrays. (i.e. 5 default products in shopping basket)
> However you would initialise other items such as the cart, the users details, input fields specifics etc.

## Event Processors

Event processors are objects that observe the `Router` for events and apply event state to the model. 
There is no object named `EventProcessor` in the ESP code base, it is simply a naming convention.

An processor is typically scoped to align with a node in the graph of the object model. 
For example, you may have an object model to describe a financial product `MyProduct`.
`MyProduct` may have a collection of legs, i.e. `MyProduct.legs`. 
There may be enough functionality for each leg to warrant its own event processor.
In this case you would instantiate a `LegEventProcessor` object that would own a particular leg on the model, i.e. `myProduct.legs[0]`. 
You can always start with a single Event Processor for your root entity then and break it down using good old fashioned OO composition principles.

## State processing workflow

When an event is published to the router it starts the state processing workflow. 
The workflow has 3 ordered stages, with each stage offering different benefits depending on what state you want to modify. 
The model can be modified at each stage.
Stage 2 can be further split into 3 sub stages that are progressive, i.e. the event may not progress through these 3 stages depending upon how event processors decide to process the event.

> If there were no stages, processors could simply apply the change to the model then raise a new event for 'reacting' processors to observe, similar for events that need to be verified before proceeding. 
> To avoid `eventType` explosion the preview and committed stages are provided around the normal stage.

At each stage user code will get a function of signature `(model, event, eventContext) => { }` to interact with.
The first two parameters are self explanatory. The `eventContext` has some methods that can affect how the event proceeds.

Any component that receives an event during the event workflow can publish subsequent events.
These subsequent events will be enqueued and processed in turn by the [Event Loop](#the-event-loop).

The below image depicts a simplistic view of this process. 
Note that `EventPublisher` and `ModelObserver` are often the same component/class. 

> This diagram doesn't cover many of the aspects covered below, i.e. the 3 event subscription sub stages available to EventProcessors, subsequent event publication nor the purging of the event queues by the [Event Loop](#the-event-loop).
> An expanded representation of the flow can be found [here](docs/FullEventProcessingFlow.png). 

![](docs/EventProcessingFlow.png?raw=true)

Below we discuss the various stages.
The example code uses this simple model:

``` javascript
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
```

The complete code for these examples below can be found [with the source](src/examples/readme/app.js).

### <a name="PreEventProcessing"></a>  1 Pre event processing

When registering a model with the router you can optionally provide an `options` object with a `preEventProcessor` property.
This property can either be an object with a `process(model, event, eventContext)` method or a function with signature `(model, event, eventContext) => { }`. 
The processor will be the first thing called. 
It's an ideal place to change state that moves with each tick of model (i.e. the version) or to reset any state that was applied specifically for the last [Event Loop](#the-event-loop). 
For example to clear a user alert, or perhaps clear a collection of messages that were dispatched on the network.

``` javascript
var router = new esp.Router();

var store = new FruitStore();
router.registerModel(
    'model1',
    store,
    {
        preEventProcessor : (model, event, eventContext) => {
            model.version++;
        }
    }
);
router.publishEvent('model1', 'noopEvent', { });
console.log("Store version: " + store.version); // 1;
```

output

```
Store version: 1
```

### 2 Event Processing

Event processors wanting to receive an event during this stage can do so by calling `router.getEventObservable()`, its full signature is:

``` javascript
var observable = router.getEventObservable(
    modelId : string,
    eventType : string
    [, stage: string = EventStage.normal]
);
```

The call takes the `modelId`, the event type and optionally an `EventStage`. 
The `modelId` should uniquely identify the model, the `eventType` identify that type of event, the optional `stage` parameter tells the router when the handler should be invoked. 
The possible values for `stage` are 'preview', 'normal' and 'committed'. 
`EventStage` contains these as properties or you can pass a string. 
All handlers registered with `EventStage.preview` receive the event first, then (if not canceled) all handlers at `EventStage.normal`.
Finally if the event was 'committed', all handlers at `EventStage.committed` will receive it.

The call returns an [observable](#observable-api).
Its `observe` method takes an observer and returns an object with a `dispose()` method, calling `dispose()` will remove the event subscription from the router.

Upon event dispatch the router passes the `model` the `event` and an `eventContext` to the given observer. 
It's likely you'll always take the `model` and `event`, and only take the `eventContext` if you want to alter the default event workflow. 
Typically you chain calls on the `observable` together (see examples below).

#### 2.1 Preview stage

The event can be canceled at this stage by calling `eventContext.cancel()`.
Other `EventStage.preview` observers will still receive the event, however it won't be delivered to observers at `EventStage.normal` or `EventStage.committed`.

``` javascript
var router = new esp.Router();

var store = new FruitStore();
router.registerModel('model1', store);

router
    .getEventObservable('model1', 'fruitExpiredEvent', esp.EventStage.normal)
    .observe((model, event) => {
        console.log("Setting hasExpired to " + event);
        model.hasExpired = event;
    });

router
    .getEventObservable('model1', 'buyFruitEvent', esp.EventStage.preview)
    .observe((model, event, eventContext) => {
        if(model.hasExpired) {
            console.log("Cancelling buyFruitEvent event as all fruit has expired");
            eventContext.cancel();
        }
    });

router
    .getEventObservable('model1', 'buyFruitEvent', esp.EventStage.normal)
    .observe((model, event) => {
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
```

output:

```
Buying fruit, quantity: 1
Stock count: 9
Setting hasExpired to true
Canceling buyFruitEvent event as all fruit has expired
Stock count: 9
Setting hasExpired to false
Buying fruit, quantity: 1
Stock count: 8
```

#### 2.2 Normal stage

The normal stage is where **most of your processing will take place**. 
If you subscribe without a stage the router will defaulted the stage to `EventStage.normal`.

``` javascript
var router = new esp.Router();

var store = new FruitStore();
router.registerModel('model1', store);

var buyFruitEventSubscription = router
    .getEventObservable('model1', 'buyFruitEvent') // i.e. stage = esp.EventStage.normal
    .observe((model, event) => {
        console.log("Buying fruit, quantity: " + event.quantity);
        model.stockCount -= event.quantity;
    });

router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });

console.log("Stock count: " + store.stockCount); // "Stock count: 9"

buyFruitEventSubscription.dispose();

router.publishEvent('model1', 'buyFruitEvent', false);

console.log("Stock count: " + store.stockCount); // still "Stock count: 9", event not delivered as subscription removed
```

output:

```
Buying fruit, quantity: 1
Stock count: 9
Stock count: 9
```

The event can be committed at this stage by calling `eventContext.commit()`. 
This method can only be called once within this stage. 
If committed, and once all other `EventStage.normal` observers have received the event, the router will then dispatch the event to observers at the committed stage.

#### 2.3 Committed stage

Processors subscribing at the committed stage should assume that the state in the event was applied to the model by an observer at `EventStage.normal`. 
They can then make reactive decisions regarding state they own, e.g. repopulating other static based on model changes.

``` javascript
var router = new esp.Router();

var store = new FruitStore();
router.registerModel('model1', store);

router
    .getEventObservable('model1', 'buyFruitEvent')
    .observe((model, event, eventContext) => {
        console.log("Buying fruit, quantity: " + event.quantity);
        model.stockCount -= event.quantity;
        eventContext.commit();
    });

router
    .getEventObservable('model1', 'buyFruitEvent', esp.EventStage.committed)
    .observe((model, event) => {
        // reacting to the buyFruitEvent we check if the shelf quantity requires refilling
        var shouldRefreshFromStore = model.stockCount < 3;
        console.log("Checking if we should refresh from store. Should refresh: " + shouldRefreshFromStore);
        model.shouldRefreshFromStore = shouldRefreshFromStore;
    });

router
    .getEventObservable('model1', 'buyFruitEvent', esp.EventStage.committed)
    .observe((model, event)=> {
        // given we've sold something we flip a dirty flag which could be used by another
        // // periodic event to determine if we should recalculate inventory
        console.log("Flagging inventory recalculate");
        model.shouldRecalculateInventory = true;
    });

router.publishEvent('model1', 'buyFruitEvent', { quantity: 1 });
console.log(store.toString()); // Stock count: 9, shouldRefreshFromStore: false, shouldRecalculateInventory: true

router.publishEvent('model1', 'buyFruitEvent', { quantity: 8 });
console.log(store.toString()); // Stock count: 1, shouldRefreshFromStore: true, shouldRecalculateInventory: true
```

output:

```
Buying fruit, quantity: 1
Checking if we should refresh from store. Should refresh: false
Flagging inventory recalculate
Stock count: 9, shouldRefreshFromStore: false, shouldRecalculateInventory: true
Buying fruit, quantity: 8
Checking if we should refresh from store. Should refresh: true
Flagging inventory recalculate
Stock count: 1, shouldRefreshFromStore: true, shouldRecalculateInventory: true
```

### <a name="PostEventProcessing"></a> 3 Post event processing

The post processing stage always runs. 
This stage is similar to the pre event processing except it runs last. 
It is advised you do not change the shape of the model at this point, it is pretty much done and dusted (for this cycle of the [event loop](#the-event-loop)).
However you can perform cross cutting validation, aggregate operations or perhaps model the nature of the change that occurred.
This can be useful for model observers to filter as appropriate. 
There is an example of a post process [above](#create-an-event-post-processor).

> Note the `eventContext` this stage receives will contain the last event published to the router for the model in question. 
> For example, event 'A' may have been the event that started the workflow, however a processor responding to event 'A' may have published event 'B'.
> If 'B' was the last event published during the event loop then 'B' will be last event set against the `eventContext`.

Event publication in this stage is allowed, however it will get processed in a new iteration of the event loop.
Thus router will treat this new event as if it is a 'first' event and re-run the workflow for the model in question.

## Model observation and sync

An object can listen for model updates by subscribing to changes for that model id via `router.getModelObservable(modelId)`. 
Similar to `router.getEventObservable(...)`, this call returns an [observable](#observable-api) which will yield changes to the observer.

``` javascript
var router = new esp.Router();
router.registerModel("modelId", { foo: 1 });
router
    .getEventObservable('modelId', 'fooChanged')
    .observe((model, event)=> {
        model.foo = event.newFoo;
    });
router
    .getModelObservable('modelId')
    .observe(model => {
        console.log("Foo is " + model.foo);
    });
router.publishEvent('modelId', 'fooChanged', { newFoo: 2 });
```

output

```
Foo is 2
```

## The event loop

The event loop kicks off once an event is published to the router via `router.publishEvent(...)`. 
Any time control flow leaves the router (before the initial call to `publishEvent(...)` returns), it is possible that further events could be raised.
Any subsequent events go onto a backing queue for their respective model.

### Event queues

Each model added to the router has its own event queue. 
Every time a call to `publishEvent(...)` occurs the event is placed on the queue for the model in question. 
During the event workflow any subsequent events raised get placed on the back of the model's event queue.
Events could be raised by a [`preEventProcessor`](#PreEventProcessing), an [event processors](#event-processors) and/or a [`postEventProcessor`](#PostEventProcessing). 
This means published events are not processed immediately, they're processed in turn. 
This allows the router to finish dealing with the current event, and allows for processors to assume the model is in a state fit for the event currently being processed.
Processors are not concerned with what is in the backing queue, only with the current event and the current state, making execution deterministic.
When the current model's event queue is empty, the router will check the queues for other models and continue until all are empty, it then dispatches the model updates. 
It must again check for any new events and finally when all are processed control flow will return to the initial event publisher.

### Bypassing the event queue with `router.executeEvent(eventType, event)`

There are edge cases when you want an event to be processed immediately rather than going onto the backing queue. 
Typically this is the exception rather than the rule because you want all processors to first respond to the current event before moving to the next.

Calling `router.executeEvent(eventType, event)` will immediately execute the event processors for the model currently being processed. 
Note that processors responding to executed events are not allowed to publish further events. 
Doing so could move the router too far forward so upon resumption of the prior event, the state isn't that which the processors would expect.

> If you find yourself relying on this method, it is usually a smell that you're not modeling your problem correctly. 
> Nearly all issues can be address with further modeling.

## Observable API

As discussed previously both `router.getEventObservable(...)` and `router.getModelObservable(...)` return an observable object. 
This is modeled on [RxJs's](https://github.com/Reactive-Extensions/RxJS) observable API but with only a few methods included.

> Why not use Rx?
>
> The push based model of Rx is ideal for pub/sub scenarios where state needs to be combined from many differing streams.
> However the full Rx API isn't suitable as introduction of asynchronicity and other methods that would result in state being held in observable streams would break the deterministic staged workflow that the router owns. 
> For example, a deferred model change by way of an asynchronous operation would happen outside of the state processing workflow.
> Then there is no guarantee the model would be still in a state suitable once the deferred event arrives. 
> Similarly, for relational operations that combine event streams into state held in observable objects/closures, when a final result yields the underlying model may not be in a state suitable for the target result.

The methods on `Observable.prototype` are:

* `do(action)` : invoke an action each time the stream yields, handy for logging and debugging.
* `take(number)` : completes the stream after the specified number of items have been received.
* `takeUntil(predicate, isInclusive)` : takes items from the stream until the delegate returns true, takes the final item based on the `isInclusive` flag.
* `where(predicate)` : only procures items that match the delegate.
* `beginWork((model, event, eventContext, onResultsReceived) => {})` : experimental, see source for documentation.

If you wish you can extend the API by adding your own methods to `Observable.prototype`, see the existing code for an example.

The below code demonstrates some similarities of use between the APIs. 
Note the function delegate signature on `router.getEventObservable(...)`, its `observe` function takes 3 parameters, the `model`, an `event` and optionally the `eventContext`.
This differs from the single object with the Rx implementation. 
The `subscribe` method is called `observe` to avoid confusion with existing code.

``` javascript
// note there are several concerns here that would exist in different
// objects within your architecture, they are all together here to demo the concepts.
var router = new esp.Router();

// add a basic model
router.registerModel(
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
    .observe((model, event) => {
        console.log("Static data received");
        model.staticData.initialised = true;
        model.staticData.clientMargin = event.clientMargin;
    }
);

// create an event stream that listens for prices
var eventSubscriptionDisposable = router
    .getEventObservable('modelId', 'priceReceivedEvent')
    // run an action when the stream yields
    .do((model, event, eventContext) => console.log("Price received"))
    // only procure the event if the condition matches
    .where((model, event, eventContext) => model.staticData.initialised)
    .observe((model, event, eventContext) => {
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
```

Output:

```
Price received
Price received
Static data received
Price received
Price with margin was set to 112
```

## Asynchronous operations

If an asynchronous operation has to be performed, its relating state should be stored on the model. 
For example you'd model that you're about to perform the request, you'd then carry out the request async. 
The router would dispatch an intermittent update so model observers know the model is busy.
Then when results are received you post the results via an event to the router.
The [`EventProcessor`](#event-processors) would then update the model with the results and denote the async operation has finished.

There is a long and a short way to do this, the long involves multiple differing events and 'work items'.
The short way involves using `beginWork()` which exists on `Observable.prototype` and does the work for you.

Note: there will be future improvements in this area and hopefully some tie in with external libraries that provide async APIs (i.e. [Rx](https://github.com/Reactive-Extensions/RxJS), [async](https://github.com/caolan/async)).

### Observable.prototype.beginWork() (beta API)

``` javascript
var router = new esp.Router();
router.registerModel("modelId", { isBusy: false, staticData:false });
router
    .getEventObservable('modelId', 'initialiseEvent')
    .beginWork((model, event, eventContext, onResultsReceived) => {
        console.log("Getting static data async");
        model.isBusy = true;
        setTimeout(() =>{
            console.log("Static returned");
            onResultsReceived({staticData:"MyStaticData"});
        }, 1000);
    })
    .observe((model, event) => {
            model.isBusy = false;
            var asyncWorkCompleteEvent = event;
            console.log(
                "Static data received:",
                asyncWorkCompleteEvent.results.staticData
            );
        }
    );
router.getModelObservable('modelId').observe(
    model => {
        if(model.isBusy) {
            console.log("GUIs busy, static data: " + model.staticData);
        }
        else {
            console.log("GUIs idle, static data: " + model.staticData);
        }
    }
);
console.log("Publishing initialiseEvent");
router.publishEvent('modelId', 'initialiseEvent', {});
console.log("initialiseEvent published");
```

output:

```
Publishing initialiseEvent
Getting static data async
GUIs busy, static data: false
initialiseEvent published
Static returned
Static data received: MyStaticData
GUIs idle, static data: false
```

### Work items

A work item is simply an object that manages the lifetime of one or many async operations that together could be thought of as a single unit of work. 
There is no object named `workItem` in the ESP code base, it is simply a related pattern for dealing with async operations. 
They work in much the same was as `Observable.prototype.beginWork()` whereby results are posted back to the router.
Usually, but not always, the results would get processed by the event processor that started the work item.

Typically you'd find that work items fall under one of the following categories:

* transient : something you create for a short lived operation, perhaps to request a price from the server.
Once the result is received it has done its job.
* long lived : something that posts multiple results (via events) back into the router.
It could potentially share its lifetime with the model root (i.e. common static data feed from downstream) or part of the model (i.e. user specific trade filter subscription).

This example demonstrate a transient work item:

``` javascript
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
        // note you could wire up more advanced disposal of this stream (i.e. use
        // a .takeUntil(), you could also leave it open if you were to later
        // expect events matching its eventType
        this.addDisposable(this._router
            .getEventObservable('modelId', 'userStaticReceivedEvent')
            .observe((model, event, eventContext) => {
                console.log("Adding static data [" + event + "] to model");
                model.staticData.push(event);
            })
        );
    }
}

var router = new esp.Router();
router.registerModel("modelId", { staticData:[]});
var staticDataEventProcessor = new StaticDataEventProcessor(router);
staticDataEventProcessor.initialise();
console.log("Sending initialiseEvent");
router.publishEvent('modelId', 'initialiseEvent', {});
```

output :

```
Sending initialiseEvent
Starting work item to get static data
Sending results event for StaticDataA
Adding static data [StaticDataA] to model
Sending results event for StaticDataB
Adding static data [StaticDataB] to model
```

## Error Flows

If an exception is unhandled during the event processing workflow the router will halt. 
Any further usage results in the initial error being wrapped and rethrown.

If an observable stream (returned from `router.getEventObservable(...)` or `router.getModelObservable(...)`) has an exception, its `onError` handler will be called.
This allows the developer to log a more detailed exception based on the streams details.
It also allows for errors in observable methods to propagate to the error handler provided to the `.observe()` call. 
Any error will halt the router, no further observers will receive the current or subsequent events/model updates.

``` javascript
var router = new esp.Router();
router.registerModel("modelId", { });
router
    .getEventObservable('modelId', 'boomEvent')
    .do(() => {throw new Error("Boom");})
    .observe(
        () => {
            console.log("This never run");
        },
        err => {
            console.log("Error in stream: " + err.message);
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
```

output :

```
Error in stream: Boom
[Router] [ERROR]: Router halted error: [Error: Boom]
Error caught: Boom
Error caught 2: Event router halted due to previous error [Error: Boom]
```

## Immutability

If you're subscribing to events via `router.getEventObservable(...)`, or listening to model changes via `router.getModelObservable(...)`, misbehaving code could store a copy of the model. 
As the model is single instance the misbehaving code could modify it outside of the event workflow. 
To protect against this you can implement `lock()/unlock()` on your model to get some protection. 
It requires you make your setters throw if a change happens when in the locked state (of course being Javascript you can change anything anytime so do your best to protect against this). 
There are 2 objects in the source, `esp.model.ModelBaseRoot` and `esp.model.ModelBase` that implement the `lock()/unlock()` pattern. 
This would be a reasonable place to start. 
Another option would be to look into cloning the model, however it may have performance issues depending on the size of the model and the frequency of model ticks.

``` javascript
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
```

Output:

```
ERROR: Model is locked, can't edit
Notional is 4
```

# Anti patterns

## Holding state outside the model

If your event processors are holding state, that state should be on the model. 
They may decide to hold instances of work items that are long lived.
Perhaps these instances get disposed with the processor.
However information relating to the progress state of the work items should be on the model, it is something others may want to react to (i.e. display a 'busy gui').

## Having dependent event processors

If you publish an event that requires a response from another processor, then perhaps these 2 processors are really dealing with the same concern and need to be merged.

You may have a complex sub system within the model.
This sub system might be better managed behind a façade that receives all events and calls methods on the façade to manipulate model state.

## Having circular dependencies between models

If you register 2 models and publish events from one to the other that's fine, however if you then find your self publishing back the other you may see some issues.

It depends on what you do, you just need to be careful to avoid event reentrancy.

## Storing a local copy of the model

If you're subscribing to events via `router.getEventObservable(...)` or listening to model changes via `router.getModelObservable(...)`, you shouldn't hold a local copy of the model.
You should only react to change when the stream yields. 
More information on this in the [immutability section](#immutability).

## Event processors subscribing to model changes

Event processors receive the model along with events by subscribing to `router.getEventObservable(...)`.
They should not listen to model changes via `router.getModelObservable(...)`.
These two concerns are on different sides of the model boundary. 
There is nothing physically stopping this, it is just an anti pattern and should be avoided.

# Examples

There is already a basic example in the _src_ in addition to all the examples in this _readme_. 
On the road map is an example that covers each of the below areas in details.
It will give an idea how you can lay out a complex systems model. 
The example will model a complex GUI screen and cover these topics:

+ Creating a model
    + Immutability
    + Modeling what changed
    + Versioning static data
    + Holding events for users confirmation
    + Multiple models & sharing model entities
+ Bootstrapping and initialising the system
    + Model hydration
    + Model persistence
    + Container usage
    + Growing and contracting models
+ Event workflow specifies
    + Pre event processors
    + EventProcessors
        + Aligning event processors with the model
        + Layout out an event processor
        + Disposing an event processor
        + Sharing common event processors with different models
    + Async operations
        + with .beginWork
        + with work items
        + with pipelines
    + Post event processors
+ Miscellaneous
    + Event context customisation
    + Façade pattern for a sub system
    + Synchronising the GUI with new model state
        ++ avoid triggering event during GUI sync

# Feature Road Map

v0.0.2

+ Better async support with pipelines: i.e. a chaining API that can delegate to 3rd part async libraries and handles marshalling async results back through the [state processing workflow](#state-processing-workflow).
+ Event reentrancy detection.
+ Memory leak and performance analysis/improvements.
+ Better model composition and reusability by allowing [`EventProcessors`](#event-processors) to subscribe to a node of a greater model.


