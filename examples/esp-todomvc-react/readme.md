# Evented State Processor (ESP) React TodoMVC Example

> ESP adds specific processing workflow around changes to a model's state.
  It takes ownership of a single root model.
  Those interested in observing the model's state observe a stream of events from a `Router`.
  Those wanting to change a model's state can publish events to the `Router`.
  The `Router` routes events to `EventProcessors` responsible for applying the new state using a state processing workflow.
  Once the workflow is done, the `Router` dispatches the most recent model version to all model observers.
  
> The single root model allows a developer to focus on modeling the problem domain without worrying about infrastructural clutter. 
  The router's observable event dispatch and state processing workflow allows a developer to compose complex state manipulation logic of smaller units which are executed in a deterministic manner.

> _[Evented State Processor (ESP) - github.com/esp/esp-js](https://github.com/esp/esp-js)_

## Learning ESP

- [Documentation](https://github.com/esp/esp-js)

### Get help from other users:

- [esp/chat on Gitter Chat](https://gitter.im/esp/chat)
- [Questions tagged esp-js on StackOverflow](http://stackoverflow.com/questions/tagged/esp-js)
- [GitHub Issues](https://github.com/esp/esp-js/issues)

*Let us [know](https://github.com/esp/esp-js/issues) if you discover anything worth sharing!*

## Running

```shell
cd esp-todomvc-react
npm install
```

Optionally run a local web server and visit [localhost:8000](http://localhost:8000/):

```shell
cd esp-todomvc-react
npm install local-web-server
ws
```
