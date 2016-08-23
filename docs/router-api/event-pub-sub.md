# Event Pub/Sub

When an event is published to a model using `router.PublishEvent()`, the `Router` will dispatch the model along with the event to all event observers.

Anything can publish an event to the `Router`, anything can observe an event on the `Router`.
Typically things outside the model publish events, and the model observes events and updates it's state when they are received.

<a name="event-observation-signature"></a>

You observe an event by calling `Router.GetEventObservable()`:

``` js
var subscription = router
    .getEventObservable('myModel', 'loginEvent')
    .subscribe(
        (event, eventContext, model) => {
            model.login(event.name);
        }
    );
```

The call to `getEventObservable()` returns an `EventObservable` which can be observed by calling `subscribe()`.
The `subscribe()` method expects a 'observe' callback taking the `event`, the `eventContext` and the `model` (some are optional in .Net, all optional in JS).
See the [complete event workflow](../advanced-concepts/complete-event-workflow.md) for more details on this, particularly the usage of `eventContext` and how you can use it to propagate the event through the the staged event workflow.

Lets look at another example.
Below we see an instance of `Model` being registered, an event `LoginEvent` being published, and an event observer receiving both the event and model instances for processing.
The event observer applies the event to the model.

``` js
class Model {
    login (userName) {
        console.log("logging in " + userName);
    }
}
// create a Router. It can manage multiple models.
var router = new esp.Router();
// register a model by id
router.addModel("myModel", new Model());
// Observe changes to the model.
var eventSubscription1 = router
    .getEventObservable("myModel", "loginEvent")
    .subscribe(
        (event, context, model) => {
            model.login(event.userName);
        }
    );
// publish an event to apply the change to the model and then dispatch the new model
// The router will then dispatch the latest model to observers (if any)
router.publishEvent("myModel", "loginEvent", { userName: "Bob" });

// ... at a later time:
// .dispose() eventSubscription1 to remove the observations on the router
```

> ##### Note
> Above we're performing tasks against the router all within one method.
> This is to demo features of the `Router`.
> Typically (but not always) model observation and event publication happen by different logical components.
> Additionally the `Router` would likely be a singleton per sub-system or application.
> 
> How you use the `Router` to build a fully functional event based system is the focus of [modelling approaches](modelling-approaches/index.md) with [examples](../examples/index.md) providing practical guidance.

> ##### Tip - Single vs Multi Model Routers
>The example above is rather verbose to demonstrate the full API.
>When working on a single model you can close over the model type and id to get a more terse `Router` API.
>For .Net this negates the need to provide the model type parameters.
>For both JS and .Net it negates the need to worry about the model id.
>
>Read [single vs multi model router](./creating-a-router.md#single-vs-multi-model-router) for more details.

> ##### Tip - Attribute/Decorator based event observation
> The .Net and JS APIs have an [attribute/decorator based event wire-up](../advanced-concepts/auto-event-observation.md).
> This removes a lot of the plumbing code seen in the above example.