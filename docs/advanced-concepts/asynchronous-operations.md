<a name="asynchronous-operations"></a>

# Asynchronous Operations

ESP is designed to be non blocking.
When performing asynchronous operation you simply model the fact, start the operation, and upon results received apply these to the model.
Like any other state changing operation, process changes on the [dispatch loop](../router-api/dispatch-loop.md), i.e. within an event observation or `RunAction()` callback (discussed below).


## Starting an Asynchronous Operation
Typically you'd start an asynchronous operation while observing another event.
In such instances you're already on the [dispatch loop](../router-api/dispatch-loop.md) and can modify the model safely.
For example you may want to increment a busy counter, or store a reference/disposable that pertains to the request about to be made.

``` js
router
    .getEventObservable('modelId', 'myEvent')
    .subscribe((event, context, model) => {
        // on the dispatch loop here
        // start async operation
        // model any state relating to it, i.e. model.IsBusy = true
    });
```
Once the async operation has started the control flow will return to the router and it will finish it's [dispatch loop](../router-api/dispatch-loop.md).
Any model observers will receive the model can process any 'busy' state accordingly.

## Processing Results from an Asynchronous Operation

When your operation is finished you need to post results back to the router so then can be processed from within the [dispatch loop](../router-api/dispatch-loop.md).
If you don't do this the router won't know changes to the model have been made, and thus won't be able to push updates to model observers.
Additionally, for implementations with threading concerns, the router may currently be processing other events so direct model manipulation from another thread will result in nondeterministic state.

There are 2 ways you can post results back to the router: `Router.RunAction()` and `Router.PublishEvent()`, both discussed below.

### Router.RunAction(() => {})

`RunAction()` is similar to event publication but simply runs the given action on the dispatch loop.
With `RunAction()` a partial [event workflow](./complete-event-workflow.md) is run for the given action.
[ObservationStage](./complete-event-workflow.md#observation-stages) observers don't get called as as there is no event, however [pre and post processor](./complete-event-workflow.md#pre-post-event-processors.md) still run.

``` js
router
    .getEventObservable('modelId', 'myEvent')
    .subscribe((event, context, model) => {
        // start async operation
        someService.doAsyncRequest(results => {
            // results received, get back onto the dispatch loop
            router.runAction('modelId', () => {
                model.applyResults(results);
                // publish further events if others need to react to the results
            });
        });
    });
```

Here is a more concrete example using attributes/decorators to wire up events:

``` js
import esp from 'esp-js';

class OrderScreen {
    constructor(router)
    {
        this._router = router;
        this.status = "Idle";
    }
    @esp.observeEvent('CurrencyPairChangedEvent')
    observeCurrencyPairChanged()
    {
        this.status = "Requesting static data";
        setTimeout(() => {
            this._router.runAction(() => {
                // pretend the data came from across the wire
                this.status = "Static data received: NewStaticData";
            });
        }, 5);
    }
}

var router = esp.SingleModelRouter.create();
var model = new OrderScreen(router);
router.setModel(model);
router.observeEventsOn(model);
router.getModelObservable().subscribe(modelUpdate => {
    console.log("Model status: %s", modelUpdate.status);
});
router.publishEvent('CurrencyPairChangedEvent', { /* some data */ } );

// Output
// Model status: Requesting static data
// Model status: Static data received: NewStaticData
```

### Publishing events

This is similar to `RunAction()` above, however rather than calling `RunAction()` you publish an event.
This is no different from any other event being published, it's just something the model needs to observe and react to.
This is often less explicit than `RunAction()` as you're async operation is started in one places and processed in another.
Sometimes it's more suitable if more than one observer needs to respond to the async results.
For example many model entities may respond to static data changes, they could all observe the event below and will receive it when published.

Below is an example using the attributes/decorators to achieve this.

``` js
import esp from 'esp-js';

class OrderScreen {
    constructor(router)
    {
        this._router = router;
        this.status = "Idle";
    }
    @esp.observeEvent('CurrencyPairChangedEvent')
    observeCurrencyPairChanged()
    {
        this.status = "Requesting static data";
        setTimeout(() => {
            this._router.publishEvent('StaticDataReceivedEvent', { staticData: "NewStaticData" });
        }, 5);
    }
    @esp.observeEvent('StaticDataReceivedEvent')
    observeStaticDataReceivedEvent(event)
    {
        this.status = "Static data received: " + event.staticData;
    }
}

var router = esp.SingleModelRouter.create();
var model = new OrderScreen(router);
router.setModel(model);
router.observeEventsOn(model);
router.getModelObservable().subscribe(modelUpdate => {
    console.log("Model status: %s", modelUpdate.status);
});
router.publishEvent('CurrencyPairChangedEvent', { /* some data */ } );

// Output
// Model status: Requesting static data
// Model status: Static data received: NewStaticData
```

### Gateways / Work Items

A Gateway (or Work Item) is simply an object who's API allows callers to fire off async operations.
The object starts the acync operation and returns immediately, when results are received it posts an event containing the results back to the router.
Typically the caller that invoked the gateway method also observes the expected event, when the event is received it applies it to the model.
If the gateway is used by many entities, the API can allow the caller to pass an id, the gateway then includes this in results events.
This allows the call to filter events based on the expected id.
There is no object named `WorkItem` or `Gateway` in the ESP code base, it is simply a related pattern for dealing with async operations.

Typically you'd find that a Gateway/WorkItem will fall under one of the following categories:

* Transient : something you create for a short lived operation, perhaps to request a price from the server.
  Once the result is received it has done its job.
  You'd really only use a gateway here if you wanted to re-use it amongst models, otherwise you'd just use `RunAction()`.
* Long lived : something that posts multiple results (via events) back into the router.
  It could potentially share its lifetime with the model root (i.e. common static data feed from downstream) or part of the model (i.e. user specific trade filter subscription).