# esp-js

## Package Purpose

The core Evented State Processor library. Provides the `Router`, all event dispatch infrastructure, `ModelBuilder` (immer-based functional model registration), `ObservationStage`, disposable lifecycle utilities, logging, and `Guard`. Every other esp-* package depends on this one.

## Role in Monorepo

- **Foundational** — no dependencies on other esp-* packages
- Direct dependents: `esp-js-react`
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
  index.ts                  # Re-exports from model/, router/, system/
  model/
    modelBuilder.ts         # ModelBuilder<TModel> — fluent builder to register models with the router
    types.ts                # EventHandler, PreviewHandler, EffectHandler, SubscriptionFactory, etc.
    subscribable.ts         # Subscribable<T> — minimal public subscription interface
  router/
    router.ts               # Router class — the central event bus
    modelRecord.ts          # Internal per-model state: event queue, streams, processors
    observationStage.ts     # ObservationStage enum: preview | normal | committed | final | all
    eventProcessors.ts      # PreEventProcessor, PostEventProcessor interfaces
    eventContext.ts         # EventContext — passed to handlers; exposes commit(), cancel(), entityKey
    envelopes.ts            # EventEnvelope<TEvent, TModel>, ModelEnvelope types
    modelAddress.ts         # ModelAddress / DefaultModelAddress for targeted event dispatch
    devtools/               # Redux DevTools integration (auto-detected)
    state.ts                # Internal Router state machine
    status.ts               # Status enum for Router lifecycle
  reactive/                 # INTERNAL — not exported from src/index.ts; do not import directly
    observable.ts           # ESP's own lightweight Observable (not RxJS)
    subject.ts              # Subject<T>
    ...
  system/
    disposables/            # Disposable, DisposableBase, CompositeDisposable, SerialDisposable
    logging/                # Logger, LoggingConfig, sinks (Level enum)
    guard.ts                # Runtime argument validation
    utils.ts                # Type utilities (isString, isFunction, etc.)
    globalState.ts          # Global singleton state (for multi-router scenarios)
```

## Key Concepts and Patterns

### Router

The `Router` is the central event bus. Key methods:

```typescript
router.addModel(modelId, initialModel, config)       // register a model (use ModelBuilder instead)
router.removeModel(modelId)
router.getModel<TModel>(modelId)                     // get the current frozen model snapshot
router.publishEvent(modelId, eventType, event)        // enqueue an event
router.broadcastEvent(eventType, event)              // send to all models
router.getEventObservable(modelId, eventType, stage) // subscribe to events imperatively
router.getModelObservable(modelId)                   // subscribe to model snapshots (Subscribable<TModel>)
router.executeEvent(eventType, event)                // dispatch an event synchronously within current dispatch context
router.isOnDispatchLoopFor(modelId)                  // check if currently executing for model
```

### ObservationStage

Events pass through up to four stages in order:

| Stage | When |
|-------|------|
| `preview` | Before mutation; call `eventContext.cancel()` to suppress |
| `normal` | Primary mutation stage — handler receives immer draft |
| `committed` | Only fires if `eventContext.commit()` was called during `normal` |
| `final` | Always fires after `normal` (and `committed` if it ran) |
| `all` | Fires at every stage |

### ModelBuilder (preferred pattern)

`ModelBuilder` is the primary way to register models. It builds an immer-based immutable model pipeline where each event handler receives an immer `Draft<TModel>` and mutates it directly. After all handlers run for a dispatch cycle, the router emits a new frozen snapshot to `getModelObservable()`.

```typescript
import {ModelBuilder} from 'esp-js';
import {immerable} from 'immer';

// Plain object state (no immer config needed)
type CounterState = { count: number };
new ModelBuilder<CounterState>(router, 'counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .withPreviewHandler('Increment', (model, event, ctx) => {
        if (model.count >= 100) ctx.cancel();
    })
    .withEffect('Increment', (model, event, ctx, publish) => {
        // fires after normal handlers; model is Readonly — publish side effects here
        publish('LogChange', { count: model.count });
    })
    .withPreEventProcessor(model => { /* before each dispatch cycle */ })
    .withPostEventProcessor((model, eventsProcessed) => { /* after each dispatch cycle */ })
    .registerWithRouter();
```

**Handler types:**

| Builder method | Handler signature | Purpose |
|---|---|---|
| `withEventHandler` | `(draft: Draft<TModel>, event, ctx) => void` | Mutate state via immer draft |
| `withPreviewHandler` | `(model: Readonly<TModel>, event, ctx) => void` | Observe/cancel before mutation |
| `withEffect` | `(model: Readonly<TModel>, event, ctx, publish) => void` | Side effects after mutation; can publish new events |
| `withEventSubscription` | `(publish) => Disposable` | Subscribe to external streams on model startup |

**Class instances as model state** must include `[immerable] = true` from `immer`:

```typescript
import {immerable} from 'immer';

class MyState {
    [immerable] = true;
    value: string = 'initial';
}

new ModelBuilder<MyState>(router, 'my-id', new MyState())
    .withEventHandler('Update', (draft, event: string) => { draft.value = event; })
    .registerWithRouter();
```

### EventProcessors

Lower-level lifecycle hooks — prefer `withPreEventProcessor`/`withPostEventProcessor` on `ModelBuilder` for new code. The interfaces remain available for advanced/internal use.

### Subscribable\<T\>

`router.getModelObservable()` returns a `Subscribable<T>` — a minimal interface with a `.subscribe()` method. Do **not** import from the internal `reactive/` module. Wrapping the subscription:

```typescript
// Wrapping without Observable.create (reactive module is internal):
const upstream = router.getModelObservable<MyState>('my-id');
const wrapped = {
    subscribe(observer: any) {
        const sub = upstream.subscribe(observer);
        return { dispose() { sub.dispose(); } };
    }
} as Subscribable<MyState>;
```

### Redux DevTools

The router auto-detects Redux DevTools extension. If `window.__REDUX_DEVTOOLS_EXTENSION__` is present and the environment variable `esp_js_devtools` is set, the `ReduxDevToolsDiagnosticMonitor` is activated with no code changes required.

## Public API

All exports flow through `src/index.ts`:

- `Router`
- `ModelBuilder`
- `EventHandler`, `PreviewHandler`, `EffectHandler`, `SubscriptionFactory`, `PreEventProcessorFn`, `PostEventProcessorFn`, `ModelConfig`
- `Subscribable`
- `ObservationStage`, `EventContext`, `EventEnvelope`, `ModelAddress`, `DefaultModelAddress`
- `EventProcessors`, `PreEventProcessor`, `PostEventProcessor`
- `DisposableBase`, `CompositeDisposable`, `Disposable`
- `Logger`, `Level`, `LoggingConfig`
- `Guard`, `utils`
- `Status`

**Not exported (internal):** `Observable`, `Subject`, `RouterObservable`, `RouterSubject` — the `reactive/` module is internal. Do not import from it directly.

**Removed in v9:** `ModelBase`, `SingleModelRouter`, `@observeEvent`, `@observeEventEnvelope`, `Health`/`HealthIndicator`, `router.runAction()`, `router.observeEventsOn()`.

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Organized to mirror `src/`: `tests/router/`, `tests/model/`, `tests/system/`
- Tests instantiate `Router` directly — no mocks required for the core
- `ModelBuilder` is used in tests to register models

## Common Tasks

**Register a model and subscribe:**
```typescript
const router = new Router();

new ModelBuilder<{ count: number }>(router, 'counter', { count: 0 })
    .withEventHandler('Increment', (draft, e: { amount: number }) => { draft.count += e.amount; })
    .registerWithRouter();

router.getModelObservable<{ count: number }>('counter')
    .subscribe(model => console.log(model.count));

router.publishEvent('counter', 'Increment', { amount: 1 });
```

**Get the current model snapshot:**
```typescript
const snapshot = router.getModel<MyState>('my-id');
// snapshot is a frozen Readonly<MyState>
```

**Subscribe to events imperatively:**
```typescript
router.getEventObservable('my-id', 'MyEvent').subscribe(envelope => {
    console.log(envelope.event);
});
```

## Gotchas

- `router.publishEvent()` throws if called from within a `normal`/`preview` event handler — use `withEffect` to publish side-effect events instead
- `router.getModelObservable()` returns `Subscribable<T>` — do NOT use `Observable.create` or import from the `reactive/` module (it is internal and not part of the public API)
- Class instances used as model state **must** have `[immerable] = true` from `immer`, otherwise `produce` throws at runtime
- `ModelRecord` maintains an event queue per model — events published during another model's dispatch are queued and processed after the current model finishes
- `broadcastEvent` dispatches to all registered models; models not observing the event simply ignore it
- `router.getModel(modelId)` returns the latest frozen snapshot; **do not hold references** across event dispatches — the reference becomes stale after the next dispatch
