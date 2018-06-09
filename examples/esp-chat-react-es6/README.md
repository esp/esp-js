# Evented State Processor (ESP) React Facebook Chat Example (ES6)

This is a port of [Flux Chat]
(https://github.com/facebook/flux/tree/master/examples/flux-chat) to [ESP 
(Evented State Processing)](https://github.com/esp/esp-js). ESP is a new
architectural design pattern that takes the concept of unidirectional data flow
to the next level by adding a clear model that comprehensively captures your
entire application's state. The model is published to your controllers as a
single observable stream of changes. Inside the the model, ESP events and
processors provide a scalable pattern for decomposing complicated
interdependent logic into manageable chunks. It's great for big, complex
applications with complex state transitions and real-time events (e.g.
streaming data).

This example is similar to the esp-chat-react app (also a port of the 
[Flux Chat](https://github.com/facebook/flux/tree/master/examples/flux-chat)) however 
it is written in ES6 and uses the 
[reactive model](http://keithwoods.gitbooks.io/esp-js/content/en/latest/modeling-approaches/reactive-domain-model.html) 
approach.

## Learning ESP

- [Documentation](http://keithwoods.gitbooks.io/esp-js/content)

### Get help from other users:

Let us [know](https://github.com/esp/esp-js/issues) if you discover anything worth sharing!*

## Running

You must have [yarn](https://yarnpkg.com/) installed on your computer.
From the root project directory run these commands from the command line:

`yarn install`

This will install all dependencies.

To build the project, first run this command:

`yarn start`

This will perform an initial build and bundle using webpack and babel, it's then start webpacks dev server.
Webpack has babel and JSX support built in so the final bundle is ready for consumption via a script tag.

Browser to [http://localhost:4000](http://localhost:4000) to view the app.

