# esp-js

## Package Purpose

The core Evented State Processor library. Provides the `Router`, all event dispatch infrastructure, `ObservationStage`, `ModelBase`, decorators (`@observeEvent`), a lightweight built-in reactive system (`Observable`, `Subject`), disposable lifecycle utilities, logging, and health monitoring. Every other esp-* package depends on this one.

## Role in Monorepo

- **Foundational** — no dependencies on other esp-* packages
- Direct dependents: `esp-js-polimer`, `esp-js-rx`, `esp-js-react`, `esp-js-ui`, `esp-js-ui-rxcompat`
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
  router/
    router.ts               # Router class — the central event bus
    singleModelRouter.ts    # Convenience wrapper for single-model use cases
    modelRecord.ts          # Internal per-model state: event queue, streams, processors
    observationStage.ts     # ObservationStage enum: preview | normal | committed | final | all
    eventProcessors.ts      # PreEventProcessor, PostEventProcessor, EventDispatchProcessor interfaces
    eventContext.ts         # EventContext — passed to handlers; exposes commit(), cancel()
    envelopes.ts            # EventEnvelope<TEvent, TModel>, ModelEnvelope types
    modelAddress.ts         # ModelAddress / DefaultModelAddress for targeted event dispatch
    decoratorObservationRegister.ts  # Wires @observeEvent metadata to router subscriptions
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
  decorators/
    observeEvent.ts         # @observeEvent and @observeEventEnvelope decorators
    espDecoratorMetadata.ts # Metadata storage and EspDecoratorUtil
  system/
    disposables/            # Disposable, DisposableBase, CompositeDisposable, SerialDisposable
    health/                 # Health, HealthIndicator, AggregateHealthIndicator
    logging/                # Logger, LoggingConfig, sinks (Level enum)
    models/
      modelBase.ts          # ModelBase abstract class
    guard.ts                # Runtime argument validation
    utils.ts                # Type utilities (isString, isFunction, etc.)
    globalState.ts          # Global singleton state (for multi-router scenarios)
```

## Key Concepts and Patterns

### Router

The `Router` is the central event bus. Key methods:

```typescript
router.addModel(modelId, model, eventProcessors?)   // register a model
router.removeModel(modelId)
router.publishEvent(modelId, eventType, event)       // enqueue an event
router.broadcastEvent(eventType, event)              // send to all models
router.runAction(modelId, action)                    // run arbitrary mutation on dispatch loop
router.getEventObservable(modelId, eventType, stage) // subscribe to events imperatively
router.getModelObservable(modelId)                   // subscribe to model updates
router.observeEventsOn(modelId, model)               // wire @observeEvent decorators on model
router.executeEvent(eventType, event)                // dispatch an event synchronously within current dispatch context
router.isOnDispatchLoopFor(modelId)                  // check if currently executing for model
```

### ObservationStage

Events pass through up to four stages in order:

| Stage | When |
|-------|------|
| `preview` | Before mutation; call `eventContext.cancel()` to suppress |
| `normal` | Primary mutation stage |
| `committed` | Only fires if `eventContext.commit()` was called during `normal` |
| `final` | Always fires after `normal` (and `committed` if it ran) |
| `all` | Fires at every stage |

### @observeEvent decorator

```typescript
class MyModel extends ModelBase {
    constructor(router: Router) {
        super('my-model-id', router);
        this.observeEvents(); // registers model + wires decorators
    }

    @observeEvent('MyEvent')
    private _onMyEvent(event: MyEvent, eventContext: EventContext, model: this) {
        // mutate this
    }

    @observeEvent('AnotherEvent', ObservationStage.preview)
    private _onPreview(event, eventContext: EventContext) {
        eventContext.cancel(); // suppress the event
    }
}
```

### ModelBase

Abstract base class that:
- Calls `router.addModel(modelId, this)` and `router.observeEventsOn(modelId, this)` in `observeEvents()`
- Auto-removes the model from the router on `dispose()`
- Provides `ensureOnDispatchLoop(action)` for safe cross-thread mutations
- Provides `this.router` and `this.modelId` accessors

### EventProcessors

Optional lifecycle hooks attached when calling `router.addModel()`:

```typescript
{
    preEventProcessor(model): void          // called before event queue drains
    postEventProcessor(model, events): void // called after all events processed
    eventDispatchProcessor(model, eventType, event, stage): void   // before each event+stage
    eventDispatchedProcessor(model, eventType, event, stage): void // after each event+stage
}
```

### SingleModelRouter

Convenience wrapper when working with a single model. Use `SingleModelRouter.create<TModel>()` or `SingleModelRouter.createWithModel(model)`.

### ESP Observable vs RxJS

The `Observable` in `esp-js` is **not** RxJS. It is a lightweight, synchronous observable designed for the router's internal event streams. For async/RxJS pipelines use `esp-js-rx` or `esp-js-polimer`'s event transforms.

### Redux DevTools

The router auto-detects Redux DevTools extension. If `window.__REDUX_DEVTOOLS_EXTENSION__` is present and the environment variable `esp_js_devtools` is set, the `ReduxDevToolsDiagnosticMonitor` is activated with no code changes required.

## Public API

All exports flow through `src/index.ts`:

- `Router`, `SingleModelRouter`
- `ModelBase`
- `ObservationStage`, `EventContext`, `EventEnvelope`, `ModelAddress`, `DefaultModelAddress`
- `EventProcessors`, `PreEventProcessor`, `PostEventProcessor`
- `observeEvent`, `observeEventEnvelope`
- `Observable`, `Subject`, `RouterObservable`, `RouterSubject`
- `DisposableBase`, `CompositeDisposable`, `Disposable`
- `Logger`, `Level`, `LoggingConfig`
- `Health`, `HealthIndicator`, `AggregateHealthIndicator`
- `Guard`, `utils`

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Organized to mirror `src/`: `tests/router/`, `tests/reactive/`, `tests/decorators/`, `tests/system/`
- Tests instantiate `Router` directly — no mocks required for the core
- `tests/router/router.*.ts` — comprehensive coverage of each Router method
- `SingleModelRouter` is often used in tests to reduce boilerplate

## Common Tasks

**Register and observe a model:**
```typescript
const router = new Router();
router.addModel('my-id', myModel);
router.getModelObservable('my-id').subscribe(model => render(model));
router.observeEventsOn('my-id', myModel); // wires @observeEvent decorators
router.publishEvent('my-id', 'Increment', { amount: 1 });
```

**Use ModelBase (preferred pattern):**
```typescript
class Counter extends ModelBase {
    count = 0;
    constructor(router: Router) { super('counter', router); this.observeEvents(); }
    @observeEvent('Increment')
    private _onIncrement(e: { amount: number }) { this.count += e.amount; }
}
```

**Subscribe to model updates:**
```typescript
router.getModelObservable<Counter>('counter').subscribe(m => console.log(m.count));
```

**Check dispatch loop and run action safely:**
```typescript
model.ensureOnDispatchLoop(() => { model.value = 42; });
```

## Gotchas

- `router.publishEvent()` throws if called from within a `normal`/`preview` event handler — use `router.runAction()` or dispatch from `committed`/`final` instead
- `observeEvents()` may only be called once per `ModelBase` instance — calling it twice throws
- The built-in `Observable` is synchronous and distinct from RxJS; do not mix the two without using `esp-js-rx`
- `ModelRecord` maintains an event queue per model — events published during another model's dispatch are queued and processed after the current model finishes
- `broadcastEvent` dispatches to all registered models; models not observing the event simply ignore it
- `emitDecoratorMetadata: true` is required at compile time for `@observeEvent` to work
