# Bypassing the event queue

There are edge cases when you want an event to be processed immediately rather than going onto the back of the [models event queue](../router-api/dispatch-loop.md#event-queues.md).
Typically this is the exception rather than the rule because you want all processors to first respond to the current event before moving to the next.

Calling `Router.ExecuteEvent()` will immediately dispatch the event to event observers for the model currently being processed.
This can only be called during a dispatch loop, in other cases you'd just call `Router.PublishEvent()`.
Note that observers responding to executed events are not allowed to publish further events.
Doing so could move the router too far forward so upon resumption of the prior event, the state isn't that which the observers would expect.


> ##### Caution
> If you find yourself relying on this method, it is usually a smell that you're not modelling your problem correctly.
> A good use case is when you want to log a user out on the server, you may want to immediately execute a 'RemoveUser' event allowing all model observers to remove specific users state.