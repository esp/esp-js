# esp-js

## Package Purpose

The core Evented State Processor library. Provides the `EventBus`, all event dispatch infrastructure, `StoreBuilder` (immer-based functional store registration), `ObservationStage`, disposable lifecycle utilities, logging, and `Guard`. Every other esp-* package depends on this one.

## Role in Monorepo

- **Foundational** — no dependencies on other esp-* packages
- Direct dependents: `esp-js-ui`, `esp-js-react`
- Published as `esp-js` on npm

## Build and Test

```bash
npm run build-dev      # vite build → .dist/esp-js.js + .dist/esp-js.esm.js
npm run build-prod     # vite build → adds .dist/esp-js.min.js (minified UMD)
npm test               # vitest --watch
npm run test-ci        # vitest run (CI)
npm run dev            # vite build --watch
```

Output: `.dist/esp-js.js` (UMD), `.dist/esp-js.esm.js` (ESM), `.dist/esp-js.min.js` (minified UMD), `.dist/typings/index.d.ts` (type declarations).

## Source Structure

```
src/
  index.ts                  # Re-exports from model/, eventBus/, system/
  model/
    storeBuilder.ts         # StoreBuilder<TModel> — fluent builder to register stores with the bus
    types.ts                # EventHandler, PreviewHandler, EffectHandler, SubscriptionFactory, etc.
    subscribable.ts         # Subscribable<T> — minimal public subscription interface
  eventBus/
    eventBus.ts             # EventBus class — the central event bus
    storeRecord.ts          # Internal per-store state: event queue, streams, processors
    observationStage.ts     # ObservationStage enum: preview | normal | committed | final | all
    eventProcessors.ts      # PreEventProcessor, PostEventProcessor interfaces
    eventContext.ts         # EventContext — passed to handlers; exposes commit(), cancel(), entityKey
    envelopes.ts            # EventEnvelope<TEvent, TModel>, ModelEnvelope types
    storeAddress.ts         # StoreAddress / DefaultStoreAddress for targeted event dispatch
    devtools/               # Redux DevTools integration (auto-detected)
    state.ts                # Internal EventBus state machine
    status.ts               # Status enum for EventBus lifecycle
  reactive/                 # INTERNAL — not exported from src/index.ts; do not import directly
    observable.ts           # ESP's own lightweight Observable (not RxJS)
    subject.ts              # Subject<T>
    ...
  system/
    disposables/            # Disposable, DisposableBase, CompositeDisposable, SerialDisposable
    logging/                # Logger, LoggingConfig, sinks (Level enum)
    guard.ts                # Runtime argument validation
    utils.ts                # Type utilities (isString, isFunction, etc.)
    globalState.ts          # Global singleton state (for multi-bus scenarios)
```

## Key Concepts and Patterns

### EventBus

The `EventBus` is the central event bus. Key methods:

```typescript
bus.storeBuilder<TModel>(storeId, initialModel)   // create a StoreBuilder for this store (preferred)
bus.removeModel(storeId)
bus.getModel<TModel>(storeId)                     // get the current frozen model snapshot
bus.publishEvent(storeId, eventType, event)        // enqueue an event
bus.broadcastEvent(eventType, event)              // send to all stores
bus.getEventObservable(storeId, eventType, stage) // subscribe to events imperatively
bus.getModelObservable(storeId)                   // subscribe to model snapshots (Subscribable<TModel>)
bus.executeEvent(eventType, event)                // dispatch an event synchronously within current dispatch context
bus.isOnDispatchLoopFor(storeId)                  // check if currently executing for store
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

### StoreBuilder (preferred pattern)

`StoreBuilder` is the primary way to register stores. It builds an immer-based immutable model pipeline where each event handler receives an immer `Draft<TModel>` and mutates it directly. After all handlers run for a dispatch cycle, the bus emits a new frozen snapshot to `getModelObservable()`.

```typescript
// Plain object state (no immer config needed)
type CounterState = { count: number };
bus.storeBuilder<CounterState>('counter', { count: 0 })
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
    .build();
```

**Handler types:**

| Builder method | Handler signature | Purpose |
|---|---|---|
| `withEventHandler` | `(draft: Draft<TModel>, event, ctx) => void` | Mutate state via immer draft |
| `withPreviewHandler` | `(model: Readonly<TModel>, event, ctx) => void` | Observe/cancel before mutation |
| `withEffect` | `(model: Readonly<TModel>, event, ctx, publish) => void` | Side effects after mutation; can publish new events |
| `withEventSubscription` | `(publish) => Disposable` | Subscribe to external streams on store startup |

**Class instances as model state** must include `[immerable] = true` from `immer`:

```typescript
import {immerable} from 'immer';

class MyState {
    [immerable] = true;
    value: string = 'initial';
}

bus.storeBuilder<MyState>('my-id', new MyState())
    .withEventHandler('Update', (draft, event: string) => { draft.value = event; })
    .build();
```

### EventProcessors

Lower-level lifecycle hooks — prefer `withPreEventProcessor`/`withPostEventProcessor` on `StoreBuilder` for new code. The interfaces remain available for advanced/internal use.

### Subscribable\<T\>

`bus.getModelObservable()` returns a `Subscribable<T>` — a minimal interface with a `.subscribe()` method. Do **not** import from the internal `reactive/` module. Wrapping the subscription:

```typescript
// Wrapping without Observable.create (reactive module is internal):
const upstream = bus.getModelObservable<MyState>('my-id');
const wrapped = {
    subscribe(observer: any) {
        const sub = upstream.subscribe(observer);
        return { dispose() { sub.dispose(); } };
    }
} as Subscribable<MyState>;
```

### Redux DevTools

The bus auto-detects Redux DevTools extension. If `window.__REDUX_DEVTOOLS_EXTENSION__` is present and the environment variable `esp_js_devtools` is set, the `ReduxDevToolsDiagnosticMonitor` is activated with no code changes required.

## Public API

All exports flow through `src/index.ts`:

- `EventBus`
- `StoreBuilder`
- `EventHandler`, `PreviewHandler`, `EffectHandler`, `SubscriptionFactory`, `PreEventProcessorFn`, `PostEventProcessorFn`, `StoreConfig`
- `Subscribable`
- `ObservationStage`, `EventContext`, `EventEnvelope`, `StoreAddress`, `DefaultStoreAddress`
- `EventProcessors`, `PreEventProcessor`, `PostEventProcessor`
- `DisposableBase`, `CompositeDisposable`, `Disposable`
- `Logger`, `Level`, `LoggingConfig`
- `Guard`, `utils`
- `Status`

**Not exported (internal):** `Observable`, `Subject`, `EventBusObservable`, `EventBusSubject` — the `reactive/` module is internal. Do not import from it directly.

**Removed in v9:** `ModelBase`, `SingleModelEventBus`, `@observeEvent`, `@observeEventEnvelope`, `Health`/`HealthIndicator`, `bus.runAction()`, `bus.observeEventsOn()`. `bus.addModel()` is now private — use `bus.storeBuilder()` instead. `ModelBuilder` renamed to `StoreBuilder`; `ModelAddress`/`DefaultModelAddress` renamed to `StoreAddress`/`DefaultStoreAddress`.

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Organized to mirror `src/`: `tests/eventBus/`, `tests/model/`, `tests/system/`
- Tests instantiate `EventBus` directly — no mocks required for the core
- `StoreBuilder` is used in tests to register stores

## Common Tasks

**Register a store and subscribe:**
```typescript
const bus = new EventBus();

bus.storeBuilder<{ count: number }>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, e: { amount: number }) => { draft.count += e.amount; })
    .build();

bus.getModelObservable<{ count: number }>('counter')
    .subscribe(model => console.log(model.count));

bus.publishEvent('counter', 'Increment', { amount: 1 });
```

**Get the current model snapshot:**
```typescript
const snapshot = bus.getModel<MyState>('my-id');
// snapshot is a frozen Readonly<MyState>
```

**Subscribe to events imperatively:**
```typescript
bus.getEventObservable('my-id', 'MyEvent').subscribe(envelope => {
    console.log(envelope.event);
});
```

## Gotchas

- `bus.publishEvent()` throws if called from within a `normal`/`preview` event handler — use `withEffect` to publish side-effect events instead
- `bus.getModelObservable()` returns `Subscribable<T>` — do NOT use `Observable.create` or import from the `reactive/` module (it is internal and not part of the public API)
- Class instances used as model state **must** have `[immerable] = true` from `immer`, otherwise `produce` throws at runtime
- `StoreRecord` maintains an event queue per store — events published during another store's dispatch are queued and processed after the current store finishes
- `broadcastEvent` dispatches to all registered stores; stores not observing the event simply ignore it
- `bus.getModel(storeId)` returns the latest frozen snapshot; **do not hold references** across event dispatches — the reference becomes stale after the next dispatch
