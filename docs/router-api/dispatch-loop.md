<a name="dispatch-loop"></a>

# Dispatch Loop

The dispatch loop exists to make event processing deterministic.
All event and model observation code **must** run within the dispatch loop.

The dispatch loop kicks off once an event is published to the `Router` via `Router.PublishEvent(...)` or an action is run via `Router.RunAction(...)`.
Any time control flow leaves the router, for example to an event or model observation callback, it's possible that further events could be raised.
Such events go onto a backing queue for their respective model.
The dispatch loop continues until all events are processed.

<a name="event-queues"></a>

## Event queues

Each model added to the router has its own event queue.
Every time a call to `Router.PublishEvent()` occurs the event is placed on the queue for the model in question.
Subsequent events could be raised anytime during the dispatch loop, such events get placed on the back of the model's event queue.
This means events published during the dispatch loop are are not processed immediately, they're processed in turn.
This allows the router to finish dealing with the current event, and allows event observers to assume the model state is fit for the event currently being processed.
Event observers need not be concerned with what is in the backing queue, only with the current event and the current state, this makes execution deterministic.
When the current model's event queue is empty, the router will check the queues for other models and continue until all are empty.

## Model updates
The `Router` pushes the model updates to observers from within the dispatch loop.
If any model observer publishes an event it will go onto the event queue for the model in question.
Again, the dispatch loop continues until all events are processed.

> ##### Tip
> The specific workflow the `Router` does on the dispatch loop is called the [event workflow](../advanced-concepts/complete-event-workflow.md).
