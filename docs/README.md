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

If you're using TypeScript [esp.d.ts](../esp.d.ts) is referenced via the `typings` property in [package.json](../package.json) so the TS compiler can discover it.

# Basic Usage

Run this example on codepen: http://codepen.io/KeithWoods/pen/yJWLQk?editors=1012

Create an ES6 style model

```js
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
    this._router.addModel(this._modelId, this);
    // instruct the router to hook up decorated event observation methods 
    this._router.observeEventsOn(this._modelId, this);      
  }
}
```

Create an app wide router.

```js
let router = new esp.Router();  
```


All models are identified by an ID so let's create one.

```js
let loginModelId = 'loginModelId';
```


Create an instance of your model.

```js
let loginModel = new LoginModel(loginModelId, router); 
// instruct it to register itself with the router
loginModel.registerWithRouter();
```

Observe the model for changes, typically done in a view.

```js
let subscription = router
  .getModelObservable(loginModelId)
  // the router has a built-in observable API with basic methods, where(), do(), map(), take() 
  .do(model =>  { /* gets invoked on each update */ })
  .subscribe(model => {
      console.log(`Updating view. Username is: ${model.username}`);
      // ... update the view 
    }
  );
```


Publish an event to change the models state, typically done from a view.
The router will fan-out delivery of the event to observers using an event-workflow.
When event processing is finished the router will fan-out deliver of the model to observers.

```js
router.publishEvent(loginModelId, 'setUsername', {username:'ben'});
```

Stop observing the model
```js
subscription.dispose();      
```

Output

````
"Updating view. Username is: anonymous"
"Updating view. Username is: ben"
```