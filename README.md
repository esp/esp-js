[![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

**[RouterProvider](#routerprovider)** |
**[SmartComponent](#smartcomponent)** |
**[Examples](#examples)** |
**[Help Topics](#help-topics)** 

# Evented State Processor (ESP) React Components

[esp-js-react](https://www.npmjs.com/package/esp-js-react) contains lightweight common infrastructure to help you build [React](https://facebook.github.io/react/) apps using [esp-js](https://github.com/esp/esp-js).
`RouterProvider` and `SmartComponent`, both React components are included. 
Additionally a `@viewBinding` decorator is included which can be used with `SmartComponent` for dynamic view resolution for a model.
 
## `RouterProvider`
`RouterProvider` is a wrapper component that takes the ESP `Router` as a prop. It simply puts the router on the React context so it can be accessed by child components. 
It's designed to wrap your app, however it can be lower if you're doing something edge-case, or you only use ESP to manage state in part of your application.

The following example shows you how to use it:

```js
import esp from 'esp-js'
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider } from 'esp-js-react';

// create an app wide router
let router = new esp.Router();

ReactDOM.render(
    <RouterProvider router={router}>
     
    </RouterProvider>,
    document.getElementById('react')
);
```

## `SmartComponent`
`SmartComponent` takes a `modelId`, observes the given model via the ESP `Router` (which is obtained via the React context thanks to `RouterProvider`), and passes the model via a prop named `model` to the child view. 
It does this each time the `Router` pushes a model update. 
 
The child view (which is a React component) is used to display the model.
The view can be resolved using 1 of 2 methods, both discussed below.
 
### Passing the view as a prop
`SmartComponent` can optionally take a `view` prop which should be set to a React component.

Building on from our previous example, we additionally import a top level model and associated view, then use `SmartComponent` to wire them up.
Note we pass the view as a prop to `SmartComponent`.

```js
import esp from 'esp-js'
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import Workspace from './models/workspace';
import WorkspaceView from './views/workspaceView.jsx';

// create an app wide router
let router = new esp.Router();

// create the main model
let workspace = new Workspace(router, modal);
workspace.observeEvents();

ReactDOM.render(
    <RouterProvider router={router}>
        <SmartComponent modelId={workspace.modelId} view={WorkspaceView} />
    </RouterProvider>,
    document.getElementById('react')
);
```

### Using a `viewBinding` decorator on the model.
If you omit the `view` prop, `SmartComponent` will assume you're using a decorator on the model to declare the model's view.
Using a decorator keeps things a little more decoupled, it allows us to keep the view closer to the model.
This is less apparent in this basic example, however in building modular applications, it allows for generic infrastructure to display views (i.e. React components) that are unknown to the infrastructure.

The only change below is the removal of the view import and `view` prop on `SmartComponent:

```js
import esp from 'esp-js'
import React from 'react';
import ReactDOM from 'react-dom';
import { RouterProvider, SmartComponent} from 'esp-js-react';
import Workspace from './models/workspace';

// create an app wide router
let router = new esp.Router();

// create the main model
let workspace = new Workspace(router, modal);
workspace.observeEvents();

ReactDOM.render(
    <RouterProvider router={router}>
        <SmartComponent modelId={workspace.modelId} />
    </RouterProvider>,
    document.getElementById('react')
);
```

We now declare the view on the model using a decorator:

```js
import { viewBinding } from 'esp-js-react';
import WorkspaceView from '../views/workspaceView.jsx';

@viewBinding(WorkspaceView)
export default class Workspace {
   
}
```

When the `SmartComponent` receives a model update from the ESP `Router` it will inspect it, get the view, create an instance of it and pass the model as a prop (named `model`) to the component.

### Additional props 

Additional props declared on the `SmartComponent` will also be passed down to the child view. 

```xml
<SmartComponent modelId={workspace.modelId} foo='someValue'>
 <-- 'foo' will be passed to the dynamically created view -->
</SmartComponent>

```

#### Multiple views, same model 

You can declare multiple views for a model by decorating it with multiple `viewBinding` decorators. 
Additional views should pass a context string as a discriminator.  

```js
import { viewBinding } from 'esp-js-react';
import WorkspaceView from '../views/workspaceView.jsx';
import WorkspaceSummaryView from '../views/workspaceSumamryView.jsx';

@viewBinding(WorkspaceView)
@viewBinding(WorkspaceSummaryView, 'workspace-summary-view')
export default class Workspace {

}
```

When using `SmartComponent` we then provide the context via the `viewContext` prop to render a different representation of the model. 
It's a clean approach to having multiple view representation of a single model.
There is nothing stopping multiple view representations for a single model within the same VDOM.
Each `SmartComponent` instance will simpley observe the same model via the router and pass the model as props when whenever it change.
   
```js
<SmartComponent modelId={workspace.modelId} viewContext='workspace-summary-view' />
```

## Examples 

The below agile board example, in the main esp-js repo, demonstrates a simple agile planning board.
It uses both [esp-js](https://www.npmjs.com/package/esp-js) and [esp-js-react](https://www.npmjs.com/package/esp-js-react) to build a unidirectional, model first application.

[![ESP Agile board Example](./docs/images/esp-agile-demo.gif)](https://github.com/esp/esp-js/tree/master/examples/esp-js-react-agile-board)

# Help Topics

See the main ESP [documentation](https://www.gitbook.com/book/keithwoods/esp-js/details) for complete help docs.
