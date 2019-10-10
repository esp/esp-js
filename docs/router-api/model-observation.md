# Model Observation

An object can observe model updates via `router.getModelObservable()`.
Similar to `router.getEventObservable()`, this call returns an observable object (`ModelObservable`) which can be used to observe model updates.

Below we enhance the example used previously to add model observation.
In this instance we have 2 observations on the `Router` for the model.
The second observation uses the chaining API provided by the `ModelObservable`, this filters (`.filter(predicate)`) the model update stream for a specific user.
All observations against the `Router` can be disposed to remove the given observer from the model.

``` js
class Model {
    get userName() {
        return this._userName;
    }
    login (userName) {
        this._userName = userName
    }
}
// create a Router. It can manage multiple models.
var router = new esp.Router();
// register a model by id
router.addModel('myModel', new Model());
// Observer changes to the model.
// Any event publication will trigger a change,
// once all events are processed a new model is pushed
var modelSubscription1 = router
    .getModelObservable('myModel')
    .subscribe(
        (model) => {
            console.log('Hello ' + model.userName);
        }
    );
var modelSubscription2 = router
    .getModelObservable('myModel')
    .filter(m => m.userName === 'Fred')
    .subscribe(
        (model) => {
            console.log('Look ' + model.userName + ' is online');
        }
    );
// Observe the events to apply changes to the model
var eventSubscription1 = router
    .getEventObservable('myModel', 'loginEvent')
    .subscribe(
        (event, context, model) => {
            model.login(event.name);
        }
    );
// publish an event to apply the change to the model and then dispatch the new model
router.publishEvent('myModel', 'loginEvent', { name: 'Bob' });router.publishEvent('myModel', 'loginEvent', { name: 'Fred' });

// ... at a later time:
// .dispose() eventSubscription1, modelSubscription1 and or modelSubscription2 to remove the observations on the router
```

> ##### Tip - Single vs Multi Model Routers
>The example above is rather verbose to demonstrate the full API.
>When working on a single model you can close over the model type and id to get a more terse `Router` API.
>For .Net this negates the need to provide the model type parameters.
>For both JS and .Net it negates the need to worry about the model id.
>
>Read [single vs multi model router](./creating-a-router.md#single-vs-multi-model-router) for more details.

> ##### Note
> Above we're performing tasks against the router all within one method.
> This is to demo features of the `Router`.
> Typically (but not always) model observation and event publication happen by different logical components.
> Additionally the `Router` would likely be a singleton per sub-system or application.
> 
> How you use the `Router` to build a fully functional event based system is the focus of [modelling approaches](../modelling-approaches/index.md) with [examples](../examples/index.md) providing practical guidance.
