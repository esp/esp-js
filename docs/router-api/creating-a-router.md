# Creating a Router

A `Router` can be configured for multiple model or single model support.
In multiple model mode it's API is a bit more verbose, you need to provide the `modelId` and typing parameters (.Net) of the particular model.
In single model mode the `modelId` and typing parameters (.Net) are not required.

## Multi Model Router
With multi model routers all events for all models run on a single [dispatch loop](../router-api/dispatch-loop.md).
This means all events for all models will be processed before any model observers receive model updates.

> ##### Tip
> As a general rule your models won't be small granular object hierarchies, they'd exist to model data relating to a system or syb-system.
> A good rule of size may be a bounded context from DDD.

### Creating a Multi Model Router

``` js
var router = new esp.Router();
```

### Using a Multi Model Router

``` js
import * as esp from 'esp-js';

class MyModel2 {
}

var router = new esp.Router();
router.addModel('modelId', new MyModel2())
// note all calls require the modelId
router
    .getEventObservable('modelId', 'fooEvent')
    .subscribe((event, context, model) => { model.foo = event.foo; });
router
    .getModelObservable('modelId')
    .subscribe(model => { console.log('foo is [%s]', model.foo)});
router.publishEvent('modelId', 'fooEvent', {foo: "NewFooValue"});

// output
// foo is [undefined]
// foo is [NewFooValue]
```

> ##### Note
> Your system may never have related models, in such cases it may be easier to simply use separate instance of single model `Routers`, discussed below.

<a name="single-vs-multi-model-router"></a>

## Single Model Router
For large models it can often be too tedious to provide a model's id and model type parameters (.Net) on all API interactions with the `Router`.
Perhaps you have a subsystem that only ever deals wih a single model, or your app is small so only warrants a single model.
In such instances the `modelId` or type parameters are unimportant.

A model specific router is simply an object that closes over the `modelId` and the typing parameters (.Net) and proxies calls to an underlying `Router`.
You can simply new a single model router up, or call `router.createModelRouter(modelId)` on an existing multi model router to obtain one.

### Creating a Single Model Router

``` js
import * as esp from 'esp-js';

////////////////////////////////////////////////////////////
// method 1, useful when the model needs the router.
////////////////////////////////////////////////////////////
class MyModel1 {
    constructor(router) {
        this._router = router;
    }
}
var model1Router = esp.SingleModelRouter.create();
model1Router.setModel(new MyModel1(model1Router));
// use model1Router as desired

////////////////////////////////////////////////////////////
// method 2, useful when the model doesn't need the router.
////////////////////////////////////////////////////////////
class MyModel2 {
}
var model2Router = esp.SingleModelRouter.createWithModel(new MyModel2());
// use model1Router as desired

////////////////////////////////////////////////////////////
// method 3, useful when you already have a router.
////////////////////////////////////////////////////////////
class MyModel3 {
    constructor(router) {
        this._router = router;
    }
}
var router = new esp.Router();
// note you don't need to register the model before creating a model router
var model3Router = router.createModelRouter("myModelId");
var model3 = new MyModel3(model3Router);
router.addModel("myModelId", model3);
// use model3Router as desired
```

### Using a single model router
Using a single model router is much the same as using a normal `Router`.
The interfaces is slimmed down as the add/remove model methods have gone.
Additionally you don't pass the `modelId` or type parameters (.Net).

``` js
import * as esp from 'esp-js';

class MyModel2 {
}
var model2Router = esp.SingleModelRouter.createWithModel(new MyModel2());
// use model1Router as desired
model2Router
    .getEventObservable('fooEvent')
    .subscribe((event, context, model) => { model.foo = event.foo; });
model2Router
    .getModelObservable()
    .subscribe(model => { console.log('foo is [%s]', model.foo)});
model2Router.publishEvent('fooEvent', {foo: "NewFooValue"});

// output
// foo is [undefined]
// foo is [NewFooValue]
```
