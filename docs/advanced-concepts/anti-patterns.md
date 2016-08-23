# Anti-Patterns

## Holding State Outside the Model

If you're holding state, that state should be on the model.
If you find you're doing business logic or validation in controllers/view models/components it's a code smell and that code should be brought into the model.

## Having Dependent Entities / Event Processors

If you publish an event from one entity/processor to another and expect a response event , then perhaps these 2 entities/processors are really dealing with the same concern and need to be merged.

You may have a complex subsystem within the model.
This subsystem might be better managed behind a facade or state-machine that receives all events and calls methods on the facade/state-machine  to manipulate model state.

## Having Circular Dependencies Between Models

If you register 2 models and publish events from one to the other that's fine, however if you find your self publishing back the other way may see some issues.

It depends on what you're doing, you just need to be careful to avoid event reentrancy.

## Storing a Local Copy of the Model

If you're subscribing to events via `router.getEventObservable()` or listening to model changes via `router.getModelObservable()`, you shouldn't hold a local copy of the model.
You should only react to change when the stream yields.
If you change the model while not on a [dispatch loop](../router-api/dispatch-loop.md) the `Router` won't know to run the [event workflow](./complete-event-workflow.md) and notify observers of changes.

## Entities/Processors Subscribing to Model Changes

Model entities / event processors receive the model along with events by subscribing to `router.getEventObservable()`.
They should not listen to model changes via `router.getModelObservable()`.
These two concerns are on different sides of the model boundary. 
There is nothing physically stopping this, it is just an anti pattern and should be avoided.
