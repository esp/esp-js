# Automatic Event Observation

When following the [reactive-model](../modelling-approaches/reactive-domain-model.md#reactive-model) approach, much of the plumbing code required to interact with the `Router` can be reduced by using attributes(.net)/decorators(JS).
Typically your entities will observe events where the event observation's lifetime matches that of the entity.
That is, the entity will observer the same set of events as long as it exists, and will stop observing these as it is disposed/finished.

By using `Router.ObserveEventsOn(obj)` you decorate methods in your entities and have the `Router` inspect the entity to wire up the event observations based on the attributes(.net)/decorators(JS).
The call returns a single disposable which you can `.Dispose()` when finished, this removes the event observations from the `Router`.

> ##### Note
> You can still observe events directly on the `Router` using `router.GetEventObservable()`, the two approaches are not mutually exclusive.

There are some examples of this approach on the [asynchronous operations](./asynchronous-operations.md) and [complete-event-workflow](./complete-event-workflow.md) pages, and/or check out the [reactive model example](../examples/index.md#reactive-model) for larger implementations.
