<a name="complete-event-workflow"></a>

# Complete Event Workflow

When an event is published to the `Router` it dispatches the event to event observers using a staged approach.
That is, you can observe the event at any one of 3 `ObservationStages`.
The `Router` first dispatches the event to observer at `ObservationStage.Preview`, then `ObservationStage.Normal` (the default) and finally (if committed) `ObservationStage.Committed`.
If there are no observers at any stage the `Router` won't begin a [dispatch loop](../router-api/dispatch-loop.md) (assuming it's not already in one, i.e. the case when an event observer published a subsequent event).

The staged workflow exists to allow you go control the flow/propagation, of events throughout your model.
It's often necessary to cancel an event, or first apply it to an entity then let other entities react to this (i.e. commit it).

You can observe at a stage by providing an `ObservationStage` in the call to `router.GetEventObservable()`.
If you don't provide a stage, it's defaulted to `ObservationStage.Normal`.

``` js
var subscription = router
    .getEventObservable('myModel', 'loginEvent', esp.ObservationStage.normal)
    .subscribe(
        (model, event, eventContext) => {
            // do stuff
        }
    );
``` 

<a name="observation-stages"></a>

## Observation Stages

### Preview stage
The Preview stage exists to give an observer a chance to cancel the event.
This is done by calling `eventContext.Cancel()` on the `EventContext` passed to the observer callback.
Other preview stage observers will still receive the event (if any), however it won't be delivered to observers at `ObservationStage.Normal` or `ObservationStage.Committed`.

### Normal stage
The normal stage is where **99% of your processing will take place**.
If you subscribe without a stage the `Router` will default the stage to `ObservationStage.Normal`.

An event can not be cancelled at this stage, however it can be committed.
Committing is done by calling `eventContext.Commit()` on the `EventContext` passed to the observe callback.

### Committed stage
Committed stage observers only receive the event if an observer at  `ObservationStage.Normal` calls `eventContext.Commit()`.
You can only commit an event once.
Committing allows a model entity that owns the event to declare the events state has been applied to the model.
It signals to observer at `ObservationStage.Normal` that event has taken place allowing them to make reactive decisions.
For example, a common use case is when a key piece of high level state changes, all lower entities then need to reset.

<a name="pre-post-event-processors"></a>

## Pre and Post Event Processing
In addition to the `ObservationStages` mentioned above, there is also pre and post event dispatch hooks.

### Pre Event Processing
The pre processing stage happens before the event is dispatched to event observer at any of the `ObservationStages`.
Typically this could be done if you need to do some high level stage changes to the model, for example increment a model version, or clear some transient collections.

### Post Event Processing
In a similar fashion to pre event processing, there is also a post event dispatch hook.
This happens after all events (including any subsequently published by event observers) have been dispatched to observers at the various `ObservationStages`.
An example use case for this is validation, or cross cutting aggregate operations on the model.
You should not expand or contract your model in the post processing stage, it's largely intended for performing validation/aggregations etc.

### How to hook into pre/post processing
There are a few ways you can opt into these hooks depending upon what you you're doing and which [modelling approach](../modelling-approaches/index.md) you're using.

You can implement a method your model which does the pre/post processing, the router will pick that up when you call `Router.AddModel(id, model)`.
Note the [sample below](#workflow-sample) uses this approach.

**Implement a specific method on your root model**

``` js
class MyModel {
    preProcess() {
    }
    postProcess() {
    }
}
```

**Provide pre/post processors at model registration time**

``` js
_router.addModel(
    'modelId',
    { version: 1 }, // model
    {
        preEventProcessor : (model) => { model.version++; },
        postEventProcessor : () => { }
    });
```

## Complete flow

The below diagram shows the complete event workflow.

> ##### Note
> While the Pre Event Processor, Event Observer and Post Event Processor are separate boxes below, in practice they can be implemented by the same model entity when using the [reactive domain approach](../modelling-approaches/reactive-domain-model.md#reactive-model).

![](../images/esp-event-workflow.png)

<a name="workflow-sample"></a>

## Sample

Here is a small sample app demonstrating some feature of the event workflow.

> ##### Tip 
> The example uses the [auto event observation](./auto-event-observation.md) approach which does away with much of the plumbing code that interacts with the router.

``` js
import esp from 'esp-js';

class Cart  {
    constructor(router) {
        this._router = router;
        this.version = 0;
        this.total = 0;
        this.items = [];
        this.totalQuantity = 0;
        this.isValid = false;
        this.status ='Shopping';
    }
    initialise() {
        this._router.observeEventsOn(this);
    }
    // router will automatically call this method for pre processing
    preProcess() {
        // happens before we process each event
        this.version++;
    }
    // router will automatically call this method for post processing
    postProcess() {
        // happens after all events for the current dispatch loop are processed
        this.total = 0;
        this.totalQuantity = 0;
        this.isValid = true;
        for(let i = 0; i < this.items.length; i++) {
            this.total += this.items[i].cost;
            this.totalQuantity += this.items[i].quantity;
            if(this.isValid && !this.items[i].isValid) {
                this.isValid = false;
            }
        }
    }
    getSummary() {
        return 'Version:' + this.version +', Status:' + this.status + ', IsValid:' + this.isValid + ', TotalQuantity:' + this.totalQuantity + ', TotalCost:' + this.total;
    }
    @esp.observeEvent('addProductEvent')
    _addProductEvent(event) {
        console.log('Model: Adding product id %s, quantity %s', event.productId, event.quantity);
        var item = new Item(event.productId, event.quantity);
        this.items.push(item);
        var disposable = this._router.observeEventsOn(item);
        // if the item is remove call disposable.Dispose() to stop it observing events
    }
    @esp.observeEvent('quantityChangedEvent', esp.ObservationStage.preview)
    _quantityChangedEvent(event, context) {
        if(this.status !== 'Shopping') {
            console.log('Model: Canceling quantityChangedEvent as we\'re not in an appropriate state');
            context.cancel();
        }
    }
    @esp.observeEvent('checkoutEvent')
    _checkoutEvent() {
        if(this.isValid) {
            console.log('Model: Moving to checkout');
            this.status = 'Checkout';
        }
    }
}

class Item {
    constructor(productId, quantity) {
        this.productId = productId;
        this.quantity = quantity;
        this.cost = 10; // hardcode for demo
        this.isValid = true;
    }
    @esp.observeEvent('quantityChangedEvent')
    _quantityChangedEvent(event) {
        if(event.productId !== this.productId) return;
        console.log('Model: Quantity changed to %s', event.quantity);
        this.quantity = event.quantity;
        if(this.quantity === 0) {
            this.isValid = false;
            this.cost = 0;
        } else {
            this.isValid = true;
            this.cost = this.quantity * this.cost;
        }
    }
}

// bit of a chicken and egg problem here whereby the router needs the model, and the model needs the rotuer
// Typically this bootstrapping code would be wrapped up at the start of your component
var router = esp.SingleModelRouter.create();
var cart = new Cart(router);
router.setModel(cart);
cart.initialise();

// code in the view would listen the model and sync the UI widgets with it's state:
router.getModelObservable().subscribe(cartUpdate => {
    console.log("UI received model update: [%s]", cartUpdate.getSummary());
});

// fake up some event that the view would publish.
// Each of these events will move the model forward and result in a new version of the model pumped to model observers
router.publishEvent('addProductEvent', { productId:1, quantity: 1 } );
router.publishEvent('quantityChangedEvent', { productId:1, quantity: 2 } );
router.publishEvent('quantityChangedEvent', { productId:1, quantity: 0 } );  // will make the model invalid
router.publishEvent('quantityChangedEvent', { productId:1, quantity: 3 } );
router.publishEvent('checkoutEvent', { } ); // moves state to 'Checkout'
router.publishEvent('quantityChangedEvent', { productId:1, quantity: 0 } ); // will get canceled as we're at checkout state

// Output:
// UI received model update: [Version:0,Status:Shopping, IsValid:false, TotalQuantity:0, TotalCost:0]
// Model: Adding product id 1, quantity 1
// UI received model update: [Version:1,Status:Shopping, IsValid:true, TotalQuantity:1, TotalCost:10]
// Model: Quantity changed to 2
// UI received model update: [Version:2,Status:Shopping, IsValid:true, TotalQuantity:2, TotalCost:20]
// Model: Quantity changed to 0
// UI received model update: [Version:3,Status:Shopping, IsValid:false, TotalQuantity:0, TotalCost:0]
// Model: Quantity changed to 3
// UI received model update: [Version:4,Status:Shopping, IsValid:true, TotalQuantity:3, TotalCost:0]
// Model: Moving to checkout
// UI received model update: [Version:5,Status:Checkout, IsValid:true, TotalQuantity:3, TotalCost:0]
// Model: Canceling quantityChangedEvent as we're not in an appropriate state
// UI received model update: [Version:6,Status:Checkout, IsValid:true, TotalQuantity:3, TotalCost:0]
```

> ##### Note
> The [API examples](https://github.com/esp/esp-js/tree/master/examples/api) further demonstrate the event workflow.
> (ESPs API is very similar between .Net and JS so please refer to these for both implementations).