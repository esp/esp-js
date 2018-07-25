# Error Flows

If an exception is unhandled during the [event processing workflow](./complete-event-workflow.md) the router will halt.
Any further usage results in the initial error being rethrown.
In short you must ensure no exception bubble back to the `Router`, once it catches an exception it can not guarantee the state of the model thus it halts.

