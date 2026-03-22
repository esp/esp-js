# esp-js

## Package Purpose

The core Evented State Processor library. Provides the `Router`, all event dispatch infrastructure, `ObservationStage`, a functional `ModelBuilder<TModel>` for registering models with immer-backed immutable state, a lightweight built-in reactive system (`Observable`, `Subject`), disposable lifecycle utilities, logging, and health monitoring. Every other esp-* package depends on this one.

## Role in Monorepo

- **Foundational** — no dependencies on other esp-* packages
- Direct dependents: `esp-js-polimer` (deprecated), `esp-js-rx`, `esp-js-react`, `esp-js-ui`, `esp-js-ui-rxcompat`
- Published as `esp-js` on npm

## Build and Test

```bash
npm run build-dev      # webpack (dev mode) → .dist/esp-js.js
npm run build-prod     # webpack (prod mode) → .dist/esp-js.js + .dist/esp-js.min.js
npm test               # jest --watchAll
npm run test-ci        # jest (CI)
npm run dev            # webpack --watch
```

Output: `.dist/esp-js.js` (UMD bundle), `.dist/typings/index.d.ts` (type declarations).

## Source Structure

```
src/
  index.ts                  # Re-exports everything (auto-generated)
  model/
    types.ts                # ModelConfig<TModel>, EventHandler, PreviewHandler, EffectHandler, PublishDelegate, SubscriptionFactory
    modelBuilder.ts         # ModelBuilder<TModel> — fluent builder; call registerWithRouter() to register
    index.ts                # Barrel export for model/
  router/
    router.ts               # Router class — the central event bus
    singleModelRouter.ts    # Convenience wrapper for single-model use cases (@deprecated)
    modelRecord.ts          # Internal per-model state: event queue, streams, handler maps, subscriptions
    observationStage.ts     # ObservationStage enum: preview | normal | committed | final | all
    eventContext.ts         # EventContext — passed to handlers; exposes commit(), cancel()
    envelopes.ts            # EventEnvelope<TEvent, TModel>, ModelEnvelope types
    modelAddress.ts         # ModelAddress / DefaultModelAddress for targeted event dispatch
    devtools/               # Redux DevTools integration (auto-detected)
    state.ts                # Internal Router state machine
    status.ts               # Status enum for Router lifecycle
  reactive/
    observable.ts           # ESP's own lightweight Observable (not RxJS)
    subject.ts              # Subject<T>
    routerObservable.ts     # Observable with router-aware subscription helpers
    routerSubject.ts        # Subject backed by router dispatch
    autoConnectedObservable.ts  # Auto-connecting observable for event stream caching
    extMethods/             # Extension methods on Observable
  system/
    disposables/            # Disposable, DisposableBase, CompositeDisposable, SerialDisposable
    health/                 # Health, HealthIndicator, AggregateHealthIndicator
    logging/                # Logger, LoggingConfig, sinks (Level enum)
    guard.ts                # Runtime argument validation
    utils.ts                # Type utilities (isString, isFunction, etc.)
    globalState.ts          # Global singleton state (for multi-router scenarios)
```

## Key Concepts and Patterns

### Router

The `Router` is the central event bus. Key methods:

```typescript
router.addModel(modelId, initialModel, config: ModelConfig<TModel>)  // register a model
router.removeModel(modelId)
router.publishEvent(modelId, eventType, event)       // enqueue an event
router.broadcastEvent(eventType, event)              // send to all models
router.getEventObservable(modelId, eventType, stage) // subscribe to events imperatively
router.getModelObservable(modelId)                   // subscribe to model updates
router.executeEvent(eventType, event)                // dispatch synchronously within current dispatch context
router.isOnDispatchLoopFor(modelId)                  // check if currently executing for model
```

In practice, use `ModelBuilder.registerWithRouter()` rather than calling `router.addModel()` directly.

### ObservationStage

Events pass through up to four stages in order:

| Stage | When | Handler type |
|-------|------|-------------|
| `preview` | Before mutation; call `eventContext.cancel()` to suppress | `PreviewHandler` — receives `Readonly<TModel>` |
| `normal` | Primary mutation stage; immer `produce` applied | `EventHandler` — receives `Draft<TModel>` |
| `committed` | Only fires if `eventContext.commit()` was called during `normal` | — |
| `final` | Always fires after `normal` (and `committed` if it ran); effects run here | `EffectHandler` — receives `Readonly<TModel>` |
| `all` | Fires at every stage | — |

### Functional ModelBuilder pattern (v9+)

`ModelBuilder<TModel>` is a pure config collector. Call `registerWithRouter()` once — it builds a `ModelConfig` and calls `router.addModel()`. The builder should not be retained after that call.

```typescript
new ModelBuilder<MyModel>(router, 'my-model', initialModel)
    .withPreviewHandler<MyEvent>('MyEvent', (model, event, ctx) => {
        if (!event.isValid) ctx.cancel();
    })
    .withEventHandler<MyEvent>('MyEvent', (draft, event, ctx) => {
        draft.value = event.value; // mutate immer draft
    })
    .withEffect<MyEvent>('MyEvent', (model, event, ctx, publish) => {
        publish('SideEffect', { source: 'MyEvent' }); // publish secondary events
    })
    .withEventSubscription(publish => {
        // set up a long-lived subscription; return a Disposable
        const sub = someStream.subscribe(v => publish('StreamUpdate', v));
        return { dispose: () => sub.unsubscribe() };
    })
    .withPreEventProcessor(model => { /* called before event queue drains */ })
    .withPostEventProcessor((model, events) => { /* called after all events */ })
    .registerWithRouter();
```

### ModelRecord (internal)

`ModelRecord` is the router's internal per-model state object. It owns:
- The event queue and dispatch streams
- Handler maps (`eventHandlers`, `previewHandlers`, `effectHandlers`)
- `subscriptionDisposables` — cleaned up on `router.removeModel()`
- `publishDelegate` — pre-bound `(eventType, event) => router.publishEvent(modelId, ...)` passed to effects

### PublishDelegate

`PublishDelegate = (eventType: string, event: any) => void` — pre-bound to a model's `modelId`. Passed to `EffectHandler` and `SubscriptionFactory` so they can publish events without holding a reference to the router or knowing the modelId.

### SingleModelRouter

`@deprecated` — Convenience wrapper for single-model use cases. Wraps a `Router` with a fixed `modelId`. Use `SingleModelRouter.create<TModel>()` or `SingleModelRouter.createWithModel(model)`.

### ESP Observable vs RxJS

The `Observable` in `esp-js` is **not** RxJS. It is a lightweight, synchronous observable designed for the router's internal event streams. For async/RxJS pipelines use `esp-js-rx`.

### Redux DevTools

The router auto-detects Redux DevTools extension. If `window.__REDUX_DEVTOOLS_EXTENSION__` is present and the environment variable `esp_js_devtools` is set, the `ReduxDevToolsDiagnosticMonitor` is activated with no code changes required.

## Public API

All exports flow through `src/index.ts`:

- `Router`, `SingleModelRouter`
- `ModelBuilder`, `ModelConfig`, `EventHandler`, `PreviewHandler`, `EffectHandler`, `PublishDelegate`, `SubscriptionFactory`
- `ObservationStage`, `EventContext`, `EventEnvelope`, `ModelAddress`, `DefaultModelAddress`
- `Observable`, `Subject`, `RouterObservable`, `RouterSubject`
- `DisposableBase`, `CompositeDisposable`, `Disposable`
- `Logger`, `Level`, `LoggingConfig`
- `Health`, `HealthIndicator`, `AggregateHealthIndicator`
- `Guard`, `utils`

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Organized to mirror `src/`: `tests/router/`, `tests/reactive/`, `tests/model/`, `tests/system/`
- Tests instantiate `Router` directly — no mocks required for the core
- `tests/router/router.*.ts` — comprehensive coverage of each Router method
- `tests/model/` — coverage of `ModelBuilder` (basic, preview, effects, subscriptions, registration)
- `SingleModelRouter` is often used in tests to reduce boilerplate

## Common Tasks

**Register a model with the builder:**
```typescript
const router = new Router();

new ModelBuilder<CounterModel>(router, 'counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .registerWithRouter();
```

**Subscribe to model updates:**
```typescript
router.getModelObservable<CounterModel>('counter').subscribe(m => console.log(m.count));
```

**Publish a secondary event from an effect:**
```typescript
.withEffect('OrderSubmitted', (model, event, ctx, publish) => {
    if (model.orders.length > 10) {
        publish('OrderLimitWarning', { count: model.orders.length });
    }
})
```

**Preview handler to cancel an event:**
```typescript
.withPreviewHandler('DeleteAll', (model, event, ctx) => {
    if (!model.isDeletionAllowed) ctx.cancel();
})
```

**Long-lived subscription:**
```typescript
.withEventSubscription(publish => {
    const id = setInterval(() => publish('Heartbeat', {}), 5000);
    return { dispose: () => clearInterval(id) };
})
```

## Gotchas

- `router.publishEvent()` throws if called from within a `normal`/`preview` event handler — use an `EffectHandler` (which runs at `final` stage) with the provided `PublishDelegate` instead
- The built-in `Observable` is synchronous and distinct from RxJS; do not mix the two without using `esp-js-rx`
- `ModelRecord` maintains an event queue per model — events published during another model's dispatch are queued and processed after the current model finishes
- `broadcastEvent` dispatches to all registered models; models not observing the event simply ignore it
- `ModelBuilder` calls `router.addModel()` internally — do not call `addModel()` for the same `modelId` twice; it will throw
- `EffectHandler` receives the **frozen immutable model** (post-produce snapshot), not a draft — it is safe to read but cannot be mutated
- `SubscriptionFactory` disposables are tracked in `ModelRecord.subscriptionDisposables` and cleaned up automatically when `router.removeModel()` is called
