# ESP v9 — Breaking Changes & Architecture

## Overview

Version 9 is a major breaking release that fundamentally changes how models are registered and managed in `esp-js`. The OO class-based model pattern has been removed and replaced with a functional, immutable-first builder pattern backed by [immer](https://immerjs.github.io/immer/).

The primary inspiration and source of lessons learned is `esp-js-polimer`. Polimer proved that immutable, immer-backed state management integrated naturally with the ESP Router's event dispatch cycle. However, polimer lived as a separate package sitting above `esp-js`, requiring consumers to depend on two packages and understand the boundary between them. v9 brings those concepts directly into the core — polimer's approach becomes the only way to use the Router.

`esp-js-polimer` is now **deprecated**. Its concepts live on inside `esp-js` itself.

---

## Motivation

### What esp-js-polimer taught us

`esp-js-polimer` introduced three ideas that proved correct in practice:

1. **Immutable model state with immer.** Passing an immer `Draft<TModel>` to event handlers is a superior model for reasoning about state changes. The frozen snapshot after each event is safe to pass around, cache, and compare by reference. Accidental mutations are caught at runtime during development.

2. **A fluent builder for model registration.** `PolimerModelBuilder` showed that a builder is the right ergonomic unit for wiring together a model's handlers, effects, and lifecycle. It eliminates the need to know about Router internals.

3. **A clean separation between mutation and side effects.** Polimer's event transforms established that code which *changes* the model and code that *reacts to* the model change are different concerns and should live in different places.

### What was wrong with the OO pattern

The original `ModelBase` + `@observeEvent` pattern had several problems:

- **Mutable models are error-prone.** Class instances mutated in-place during event dispatch are difficult to snapshot, diff, or audit. React integrations required careful shouldComponentUpdate logic to avoid stale renders.
- **Decorator magic obscured the dispatch.** `@observeEvent` used TypeScript experimental decorator metadata and prototype scanning. The wiring was invisible — you had to know that `observeEvents()` in the constructor scanned the prototype chain and subscribed each decorated method.
- **OO models coupled structure to the Router.** `ModelBase` extended `DisposableBase` and held a router reference. Models couldn't be plain objects.
- **`runAction` was an escape hatch that encouraged mutation.** It allowed arbitrary code to run against a mutable model on the dispatch loop — the opposite of the immutable discipline polimer established.

### Why merge rather than extend polimer

Polimer worked well but the two-package split created friction:

- New users had to discover polimer existed and understand which package owned what
- The `esp-js` core still exported `ModelBase` and decorators alongside polimer's builder, creating two competing patterns in the same codebase
- Polimer had to use extension methods and side-effect imports to patch the Router's `getModelObservable` to unwrap its `PolimerModel` wrapper — a symptom of operating outside the core

By making the builder pattern the *only* registration path in `esp-js`, the Router can own the full dispatch cycle natively. No wrapper types, no unwrapping, no side-effect patches.

---

## Breaking Changes

### `router.addModel()` — new signature

**Before:**
```typescript
router.addModel(modelId: string, model: any, eventProcessors?: EventProcessors): void
```

**After:**
```typescript
router.addModel<TModel>(modelId: string, initialModel: TModel, config: ModelConfig<TModel>): ModelRegistration
```

The method now takes a plain object as the initial model state and a `ModelConfig` produced by `ModelBuilder`. It returns a `ModelRegistration` that manages the model's lifetime.

### `ModelBase` — removed

The `ModelBase` abstract class is removed. There is no class to extend. Models are plain TypeScript objects or interfaces.

### `@observeEvent` / `@observeEventEnvelope` decorators — removed

The decorator-based event subscription system is removed entirely, along with all supporting infrastructure (`EspDecoratorUtil`, `EspDecoratorMetadata`, `DecoratorTypes`, `ObserveEventPredicate`, etc.).

### `router.observeEventsOn()` — removed

The method that scanned an object for `@observeEvent` decorated methods and wired them to the Router is removed.

### `router.runAction()` — removed

The `runAction` escape hatch for running arbitrary mutable code on the dispatch loop is removed. Effects registered via `withEffect` replace this pattern for side effects that need to happen after a state change.

### `EventProcessors` interface — removed from public API

The `EventProcessors` bag (`preEventProcessor`, `postEventProcessor`, `eventDispatchProcessor`, `eventDispatchedProcessor`) is no longer passed to `addModel`. Pre and post processors are registered via `ModelBuilder.withPreEventProcessor()` and `withPostEventProcessor()`. The per-event-per-stage dispatch processors (`eventDispatchProcessor`, `eventDispatchedProcessor`) are removed from the public API.

### Removed exports

The following are no longer exported from `esp-js`:

```
ModelBase
observeEvent
observeEventEnvelope
EspDecoratorUtil
EspMetadata
DecoratorTypes
EventObservationMetadata
ObserveEventPredicate
PolimerEventPredicate
EventProcessors
PreEventProcessor
PostEventProcessor
EventDispatchProcessor
DecoratorObservationRegister
```

---

## New API

### `ModelBuilder<TModel>`

A fluent builder that collects model configuration and registers the model with the Router. The builder is discarded after `registerWithRouter()` — all state lives inside the Router's `ModelRecord`.

```typescript
const registration = new ModelBuilder<CounterModel>(router, 'counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .withPreviewHandler('Increment', (model, event, ctx) => {
        if (event.amount < 0) ctx.cancel();
    })
    .withEffect('Increment', (model, event, eventContext, publish) => {
        if (model.count > 100) {
            publish('CounterCapped', { cappedAt: model.count });
        }
    })
    .withEventSubscription(publish => {
        const interval = setInterval(() => publish('Tick', {}), 1000);
        return { dispose: () => clearInterval(interval) };
    })
    .registerWithRouter();

// Later:
registration.dispose(); // removes model from router and tears down subscriptions
```

### Handler types

| Method | Stage | Receives | Can mutate? |
|---|---|---|---|
| `withEventHandler(eventType, handler)` | `normal` | `Draft<TModel>` (immer draft) | Yes — via draft only |
| `withPreviewHandler(eventType, handler)` | `preview` | `Readonly<TModel>` (frozen) | No — can only call `cancel()` |
| `withEffect(eventType, handler)` | `final` | `Readonly<TModel>` (frozen post-mutation) | No — can call `publish()` |

### `ModelRegistration`

Returned by `registerWithRouter()`. Holds the `modelId` and a `dispose()` method that removes the model from the Router and tears down all subscription disposables.

```typescript
interface ModelRegistration {
    readonly modelId: string;
    dispose(): void;
}
```

### `ModelConfig<TModel>`

The plain value object produced by `ModelBuilder` and consumed by `router.addModel()`. Not typically constructed directly — use `ModelBuilder`.

### `PublishDelegate`

`(eventType: string, event: any) => void` — a pre-bound function passed to effect handlers and subscription factories that routes events to the model without needing a direct router or modelId reference.

### New exports

```
ModelBuilder
ModelRegistration
ModelConfig
PublishDelegate
EventHandler
PreviewHandler
EffectHandler
SubscriptionFactory
PreEventProcessorFn
PostEventProcessorFn
```

---

## Architecture

### Dispatch cycle with the new model

Every model registered via `ModelBuilder` follows this dispatch cycle for each event:

```
preEventProcessor(frozenModel)                    ← optional, once per queue drain

for each event in queue:

  preview stage
    → previewHandlers fire with frozen model
    → eventContext.cancel() stops all further stages

  normal stage (if not cancelled)
    → immer produce(currentModel, draft => {
        all withEventHandler handlers for this eventType, in order
      })
    → currentModel updated to new frozen snapshot
    → getEventObservable(normal) subscribers notified with post-mutation model

  committed stage (if eventContext.commit() was called)
    → getEventObservable(committed) subscribers notified

  final stage
    → getEventObservable(final) subscribers notified
    → withEffect handlers fire with frozen post-mutation model
    → events published via publish() are enqueued for next drain

postEventProcessor(frozenModel, eventsProcessed)  ← optional, once per queue drain

getModelObservable subscribers notified           ← receives raw frozen POJO, no unwrapping
```

### ModelRecord consolidation

Previously, `ModelRecord` was an internal routing record and polimer's `PolimerModel` was a separate wrapper sitting alongside it. In v9 all per-model state lives directly in `ModelRecord`:

- `currentModel` — the live frozen snapshot (replaces the old generic `model` reference)
- `eventHandlers`, `previewHandlers`, `effectHandlers` — maps populated from `ModelConfig`
- `subscriptionDisposables` — disposables from subscription factories
- `publishDelegate` — pre-bound publish function

`getModelObservable(modelId)` now emits the raw frozen POJO directly. There is no `PolimerModel` wrapper to unwrap, no side-effect import to patch the observable.

### immer integration

`immer` is now a direct runtime dependency of `esp-js` (bundled into the UMD output). The Router calls `produce()` at the normal observation stage internally. Consumers do not need to import or configure immer themselves.

In development, immer's auto-freeze is active: any attempt to mutate a model snapshot outside a handler draft will throw. In production, structural sharing keeps memory overhead low.

---

## Migration Guide

### Replacing ModelBase + @observeEvent

**Before (v8):**
```typescript
class CounterModel extends ModelBase {
    count = 0;

    constructor(router: Router) {
        super('counter', router);
        this.observeEvents();
    }

    @observeEvent('Increment')
    private _onIncrement(event: { amount: number }) {
        this.count += event.amount;
    }
}

const model = new CounterModel(router);
router.getModelObservable<CounterModel>('counter').subscribe(m => render(m));
router.publishEvent('counter', 'Increment', { amount: 1 });
```

**After (v9):**
```typescript
interface CounterModel {
    count: number;
}

const registration = new ModelBuilder<CounterModel>(router, 'counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .registerWithRouter();

router.getModelObservable<CounterModel>('counter').subscribe(m => render(m));
router.publishEvent('counter', 'Increment', { amount: 1 });
```

### Replacing runAction

**Before (v8):**
```typescript
router.runAction('my-model', model => {
    model.someFlag = true;
});
```

**After (v9):** Publish an event and handle it:
```typescript
router.publishEvent('my-model', 'SetFlag', { flag: true });

// in the builder:
.withEventHandler('SetFlag', (draft, event) => {
    draft.someFlag = event.flag;
})
```

### Replacing EventProcessors

**Before (v8):**
```typescript
router.addModel('my-model', model, {
    preEventProcessor: (m) => console.log('before', m),
    postEventProcessor: (m, events) => console.log('after', events),
});
```

**After (v9):**
```typescript
new ModelBuilder<MyModel>(router, 'my-model', initialModel)
    .withPreEventProcessor(m => console.log('before', m))
    .withPostEventProcessor((m, events) => console.log('after', events))
    .registerWithRouter();
```

### Replacing effects / async side effects

**Before (v8, with polimer):** Used `@eventTransformFor` returning an RxJS observable.

**After (v9):** Use `withEffect` for synchronous follow-on events. For async work (HTTP, WebSocket), use `withEventSubscription` to wire an external source, or publish an event from an effect and handle the async response via a subscription factory.

```typescript
.withEffect('FetchUser', (model, event, ctx, publish) => {
    fetchUser(event.userId).then(user => publish('UserLoaded', { user }));
})
```

---

## esp-js-polimer removal

`esp-js-polimer` has been **deleted** from the monorepo. The package is no longer published.

Polimer's concepts — immutable state, immer drafts, builder registration, event transforms — are the direct ancestors of the v9 `esp-js` API. The `ModelBuilder` in `esp-js` is the replacement.

Migration reference:

| esp-js-polimer | esp-js v9 |
|---|---|
| `PolimerModelBuilder` | `ModelBuilder` |
| `withStateHandlers(key, handlers)` (per-slice) | `withEventHandler` on the full model |
| `@eventTransformFor` (RxJS observable transforms) | `withEffect` + `withEventSubscription` |
| `PolimerModel.getImmutableModel()` | `router.getModelObservable()` — emits the POJO directly |

---

## esp-js-react — polimer integration removed

`esp-js-react` no longer depends on or integrates with `esp-js-polimer`. The model contract is now simple: `router.getModelObservable()` always emits a **frozen immutable POJO** (produced by immer via `ModelBuilder`). No unwrapping is needed.

### `useSyncModelWithSelector` — removed option

`tryPreSelectPolimerImmutableModel` has been removed from `SyncModelWithSelectorOptions`. This option previously called `model.getEspPolimerImmutableModel()` before applying the selector. Since the model is now the direct frozen snapshot, no pre-selection is necessary.

**Before (v8 with polimer):**
```typescript
syncModelWithSelectorOptions<MyModel>()
    .setModelId('my-model')
    .setTryPreSelectPolimerImmutableModel(true) // removed
    .build()
```

**After (v9):**
```typescript
syncModelWithSelectorOptions<MyModel>()
    .setModelId('my-model')
    .build()
```

### `ConnectableComponent` — duck-typing removed

`ConnectableComponent` previously checked for `getEspPolimerImmutableModel` on the model and unwrapped it before passing to `mapModelToProps`. This duck-typing is removed. The raw frozen model is passed directly.

### Reactive API internalized

The `reactive/` module in `esp-js` is now internal-only and is not exported from `src/index.ts`. `Observable`, `Subject`, `RouterObservable`, and `RouterSubject` are no longer part of the public API.

Code that previously used `Observable.create` to wrap `router.getModelObservable()` must be updated to wrap the `subscribe` method directly:

```typescript
// Before (broken — Observable is no longer exported):
const wrapped = Observable.create<MyModel>(o => router.getModelObservable('id').subscribe(o));

// After:
const upstream = router.getModelObservable<MyModel>('id');
const wrapped = {
    subscribe(observer: any) {
        return upstream.subscribe(observer);
    }
} as Subscribable<MyModel>;
```
