<a name="multithreading"></a>

# Multithreading

> ##### Note: Only applicable to .Net implementation.

ESP enforces all business logic to be processed on a single thread.
This elevates the need to worry about threading.

> ##### Tip
> Threading code mixed with business logic often mean there is a deficiency in the system elsewhere (i.e. you don't have a threading model/design in place).

When you create a `Router` there are overloads which govern which thread you want the `Router` to use.
By default it uses the current thread, in most cases this will do, however this overloads requires you always use the `Router` on that same thread.
I.e. it will throw if you access it from another thread.

If you want the `Router` to be accessed from any thread you must provide a `IRouterDispatcher` at construction time.
A `IRouterDispatcher` should implement an internal dispatch-queue/trampoline in order for the `Router` to be able to enqueue events for processing.
The nuget package `esp-net-dispatchers` has an implementation of an `IRouterDispatcher` called `NewThreadRouterDispatcher`.
As the name suggests, it creates a dedicated thread for the `Router` to use.

If you want to perform async operations, these should not be handled on the same thread as the `IRouterDispatcher`, they should be handled on background thread.
Results from async operations can be published by way of events or by  using `router.RunAction()`.
Please see [asynchronous-operations](./asynchronous-operations.md) for details on the recommended approach to async operations.
