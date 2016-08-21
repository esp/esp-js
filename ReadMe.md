[![Build Status](https://travis-ci.org/esp/esp-js.svg?branch=master)](https://travis-ci.org/esp/esp-js)
[![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
[![Join the chat at https://gitter.im/esp/chat](https://badges.gitter.im/Join%20Chat.svg)](https://gitter.im/esp/chat?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)

# Evented State Processor (ESP)

ESP gives you the ability to manage changes to a model in a deterministic event driven manner.
It does this by adding specific processing workflow around changes to a model's state. 
It was born out of the need to manage complex UI and/or server state.

At its core is a `Router` which sits between event publishers and the model.
Those wanting to change the model publish events to the `Router`.
The model observes the events and applies the changes.
The model is then dispatched to model observers so new state can be applied.
It's lightweight, easy to apply and puts the model at the forefront of your design.

Get the source from [github](https://github.com/esp/esp-js) and the packages from [npm](https://www.npmjs.com/package/esp-js).

# Installation
Install from npm: `npm install esp-js --save`.

If you're using ES6 with a package manager such as [webpack](https://webpack.github.io) you can import `esp` like this:

```javascript
import esp from 'esp-js';
var router = new esp.Router();
```

Alternatively you can reference `dist\esp.js` or `dist\esp.min.js` via a `script` tag. These files expose `esp` using the Universal Module Definition (UMD) format. 

# Basic Usage

```js
// see this example on codepen: 
// http://codepen.io/KeithWoods/pen/yJWLQk?editors=1012

// Create an ES6 style model
class LoginModel {
  constructor(modelId, router) {
    this._modelId = modelId;
    this._router = router;
    this.username = 'anonymous';
  }
  // observe events using decorators 
  @esp.observeEvent('setUsername')
  _onSetUsername(event) {
    this.username = event.username;
  }
  registerWithRouter() {
    // register the model with the router
    router.addModel(this._modelId, this);
    // instruct the router to hook up decorated event observation methods 
    router.observeEventsOn(this._modelId, this);      
  }
}

// create an app wide router
let router = new esp.Router();  

// all models are identified by an ID so let's create one
let loginModelId = 'loginModelId';

// create an instance of your model
let loginModel = new LoginModel(loginModelId, router); 
// instruct it to register itself with the router
loginModel.registerWithRouter();

// observe the model for changes, typically done in a view
let subscription = router
  .getModelObservable(loginModelId)
  // the router has a built-in observable API with basic methods, where(), do(), map(), take() 
  .do(model =>  { /* gets invoked on each update */ })
  .subscribe(model => {
      console.log(`Updating view. Username is: ${model.username}`);
      // ... update the view 
    }
  );

// Publish an event to change the models state, typically done from a view.
// The router will fan-out delivery of the event to observers using an event-workflow.
// When event processing is finished the router will fan-out deliver of the model to observers
router.publishEvent(loginModelId, 'setUsername', {username:'ben'});

// stop observing the model
subscription.dispose();      

// Output:
// "Updating view. Username is: anonymous"
// "Updating view. Username is: ben"
```

# Help Topics

* [Getting Started](docs/getting-started/index.md)
  * [Overview](docs/getting-started/overview.md)
  * [Installation](docs/getting-started/installation.md)
* [Router Api](docs/router-api/index.md)
  * [Creating a Router](docs/router-api/creating-a-router.md)
  * [Registering a model](docs/router-api/registering-a-model.md)
  * [Event Pub/Sub](docs/router-api/event-pub-sub.md)
  * [Model Observation](docs/router-api/model-observation.md)
  * [Dispatch Loop](docs/router-api/dispatch-loop.md)
* [Modelling Approaches](docs/modelling-approaches/index.md)
  * [Domain model](docs/modelling-approaches/domain-model.md)
  * [Event Processor Domain Model](docs/modelling-approaches/event-processor-domain-model.md)
  * [Reactive Domain Model](docs/modelling-approaches/reactive-domain-model.md)
* [Advanced Concepts](docs/advanced-concepts/index.md)
  * [Complete Event Workflow](docs/advanced-concepts/complete-event-workflow.md)
  * [Asynchronous Operations](docs/advanced-concepts/asynchronous-operations.md)
  * [Automatic Event Observation](docs/advanced-concepts/auto-event-observation.md)
  * [Error Flows](docs/advanced-concepts/error-flows.md)
  * [Multithreading](docs/advanced-concepts/multithreading.md)
  * [Bypassing the event queue](docs/advanced-concepts/bypassing-the-event-queue.md)
  * [Anti-Patterns](docs/advanced-concepts/anti-patterns.md)
  * [Reactive API](docs/advanced-concepts/reactive-api.md)
* [Examples](docs/examples/index.md)
  * [esp-js](docs/examples/index.md#esp-js)
  * [esp-net](docs/examples/index.md#esp-net)
* [Getting Help](docs/getting-help/index.md)
* [Contribute](docs/contribute/index.md)
* [Licence](docs/licence/index.md)