# ESP v9 — Breaking Changes & Architecture

## Overview

Version 9 is a major breaking release that fundamentally changes how models are registered and managed in `esp-js`. The OO class-based model pattern has been removed and replaced with a functional, immutable-first builder pattern backed by [immer](https://immerjs.github.io/immer/).

The primary inspiration and source of lessons learned is `esp-js-polimer`. Polimer proved that immutable, immer-backed state management integrated naturally with the ESP EventBus's event dispatch cycle. However, polimer lived as a separate package sitting above `esp-js`, requiring consumers to depend on two packages and understand the boundary between them. v9 brings those concepts directly into the core — polimer's approach becomes the only way to use the EventBus.

`esp-js-polimer` is now **deprecated**. Its concepts live on inside `esp-js` itself.

---

## Motivation

### What esp-js-polimer taught us

`esp-js-polimer` introduced three ideas that proved correct in practice:

1. **Immutable model state with immer.** Passing an immer `Draft<TModel>` to event handlers is a superior model for reasoning about state changes. The frozen snapshot after each event is safe to pass around, cache, and compare by reference. Accidental mutations are caught at runtime during development.

2. **A fluent builder for model registration.** `PolimerModelBuilder` showed that a builder is the right ergonomic unit for wiring together a model's handlers, effects, and lifecycle. It eliminates the need to know about EventBus internals.

3. **A clean separation between mutation and side effects.** Polimer's event transforms established that code which *changes* the model and code that *reacts to* the model change are different concerns and should live in different places.

### What was wrong with the OO pattern

The original `ModelBase` + `@observeEvent` pattern had several problems:

- **Mutable models are error-prone.** Class instances mutated in-place during event dispatch are difficult to snapshot, diff, or audit. React integrations required careful shouldComponentUpdate logic to avoid stale renders.
- **Decorator magic obscured the dispatch.** `@observeEvent` used TypeScript experimental decorator metadata and prototype scanning. The wiring was invisible — you had to know that `observeEvents()` in the constructor scanned the prototype chain and subscribed each decorated method.
- **OO models coupled structure to the EventBus.** `ModelBase` extended `DisposableBase` and held a router reference. Models couldn't be plain objects.
- **`runAction` was an escape hatch that encouraged mutation.** It allowed arbitrary code to run against a mutable model on the dispatch loop — the opposite of the immutable discipline polimer established.

### Why merge rather than extend polimer

Polimer worked well but the two-package split created friction:

- New users had to discover polimer existed and understand which package owned what
- The `esp-js` core still exported `ModelBase` and decorators alongside polimer's builder, creating two competing patterns in the same codebase
- Polimer had to use extension methods and side-effect imports to patch the EventBus's `getModelObservable` to unwrap its `PolimerModel` wrapper — a symptom of operating outside the core

By making the builder pattern the *only* registration path in `esp-js`, the EventBus can own the full dispatch cycle natively. No wrapper types, no unwrapping, no side-effect patches.

---

## Breaking Changes

### Terminology: `router` / `modelId` → `bus` / `storeId`

Throughout the API, the concept of a "model" registered with a "router" has been renamed to a "store" registered with a "bus":

| v8 | v9 |
|---|---|
| `router` / `Router` | `bus` / `EventBus` |
| `modelId` | `storeId` |
| `bus.addModel(modelId, ...)` | `bus.storeBuilder(storeId, ...)` |
| `bus.getModelObservable(modelId)` | `bus.getModelObservable(storeId)` (same method, new param name) |
| `ModelBuilder` | `StoreBuilder` |
| `ModelRecord` | `StoreRecord` |
| `ModelAddress` / `DefaultModelAddress` | `StoreAddress` / `DefaultStoreAddress` |

### `bus.addModel()` — now private

`bus.addModel()` is no longer part of the public API. Use `bus.storeBuilder(storeId, initialState)` instead:

**Before:**
```typescript
router.addModel(modelId, model, eventProcessors)
```

**After:**
```typescript
bus.storeBuilder<TModel>(storeId, initialState)
    .withEventHandler(...)
    .build();
```

### `ModelBase` — removed

The `ModelBase` abstract class is removed. There is no class to extend. Stores are plain TypeScript objects, interfaces, or class instances with `[immerable] = true`.

### `@observeEvent` / `@observeEventEnvelope` decorators — removed

The decorator-based event subscription system is removed entirely, along with all supporting infrastructure (`EspDecoratorUtil`, `EspDecoratorMetadata`, `DecoratorTypes`, `ObserveEventPredicate`, etc.).

### `bus.observeEventsOn()` — removed

The method that scanned an object for `@observeEvent` decorated methods and wired them to the EventBus is removed.

### `bus.runAction()` — removed

The `runAction` escape hatch for running arbitrary mutable code on the dispatch loop is removed. Effects registered via `withEffect` replace this pattern for side effects that need to happen after a state change.

### `EventProcessors` interface — removed from public API

The `EventProcessors` bag (`preEventProcessor`, `postEventProcessor`, `eventDispatchProcessor`, `eventDispatchedProcessor`) is no longer passed to `addModel`. Pre and post processors are registered via `StoreBuilder.withPreEventProcessor()` and `withPostEventProcessor()`. The per-event-per-stage dispatch processors (`eventDispatchProcessor`, `eventDispatchedProcessor`) are removed from the public API.

### `Health` / `HealthIndicator` — removed

Health check infrastructure has been removed from `esp-js`.

### `SingleModelEventBus` — removed

The `SingleModelEventBus` convenience wrapper is removed. Use `EventBus` directly with `storeBuilder()`.

### Removed exports from `esp-js`

```
ModelBase
SingleModelEventBus
observeEvent
observeEventEnvelope
EspDecoratorUtil
EspMetadata
DecoratorTypes
EventObservationMetadata
ObserveEventPredicate
PolimerEventPredicate
Health
HealthIndicator
```

---

## New API

### `StoreBuilder<TModel>`

A fluent builder that collects store configuration and registers the store with the EventBus. Call `.build()` to activate — the builder is then discarded.

```typescript
bus.storeBuilder<CounterState>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .withPreviewHandler('Increment', (model, event, ctx) => {
        if (event.amount < 0) ctx.cancel();
    })
    .withEffect('Increment', (model, event, ctx, publish) => {
        if (model.count > 100) {
            publish('CounterCapped', { cappedAt: model.count });
        }
    })
    .withEventSubscription(publish => {
        const interval = setInterval(() => publish('Tick', {}), 1000);
        return { dispose: () => clearInterval(interval) };
    })
    .withPreEventProcessor(model => { /* before each dispatch cycle */ })
    .withPostEventProcessor((model, eventsProcessed) => { /* after each dispatch cycle */ })
    .build();
```

**Class instances as store state** must include `[immerable] = true` from `immer`:

```typescript
import { immerable } from 'immer';

class MyState {
    [immerable] = true;
    value: string = 'initial';
}

bus.storeBuilder<MyState>('my-id', new MyState())
    .withEventHandler('Update', (draft, event: string) => { draft.value = event; })
    .build();
```

### Handler types

| Builder method | Stage | Receives | Can mutate? |
|---|---|---|---|
| `withEventHandler(eventType, handler)` | `normal` | `Draft<TModel>` (immer draft) | Yes — via draft only |
| `withPreviewHandler(eventType, handler)` | `preview` | `Readonly<TModel>` (frozen) | No — can only call `cancel()` |
| `withEffect(eventType, handler)` | `final` | `Readonly<TModel>` (frozen post-mutation) | No — can call `publish()` |

### New exports from `esp-js`

```
StoreBuilder
StoreConfig
EventHandler
PreviewHandler
EffectHandler
SubscriptionFactory
PreEventProcessorFn
PostEventProcessorFn
StoreAddress
DefaultStoreAddress
```

---

## Architecture

### Dispatch cycle

Every store registered via `StoreBuilder` follows this dispatch cycle for each event:

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

### StoreRecord

Previously, `ModelRecord` was an internal routing record and polimer's `PolimerModel` was a separate wrapper sitting alongside it. In v9 all per-store state lives directly in `StoreRecord`:

- `currentModel` — the live frozen snapshot
- `eventHandlers`, `previewHandlers`, `effectHandlers` — maps populated from `StoreConfig`
- `subscriptionDisposables` — disposables from subscription factories
- `publishDelegate` — pre-bound publish function

`getModelObservable(storeId)` now emits the raw frozen POJO directly. There is no `PolimerModel` wrapper to unwrap, no side-effect import to patch the observable.

### immer integration

`immer` is now a direct runtime dependency of `esp-js` (bundled into the UMD output). The EventBus calls `produce()` at the normal observation stage internally. Consumers do not need to import or configure immer themselves — except when using class instances as store state, where `[immerable] = true` must be set on the class.

In development, immer's auto-freeze is active: any attempt to mutate a model snapshot outside a handler draft will throw. In production, structural sharing keeps memory overhead low.

---

## New Package: `esp-js-ui`

`esp-js-ui` has been completely rewritten. The old OO inheritance and decorator-based module system is replaced with explicit fluent builders: `AppBuilder` and `ModuleBuilder`.

### `AppBuilder`

Creates a fully bootstrapped application with an `EventBus` and root IoC container:

```typescript
import { AppBuilder } from 'esp-js-ui';

const app = AppBuilder
    .create('my-app')
    .withContainerConfiguration(container => {
        container.register('myService', MyService).singleton();
    })
    .withModule(ordersModule)
    .withModule(async () => import('./newsModule').then(m => m.newsModule)) // lazy factory
    .withInitialisation(async (app) => { /* app-level init before modules */ })
    .withStart(async (app) => { /* app-level start after modules */ })
    .build();

await app.start();
// app.eventBus, app.container, app.modules are now available
```

`app.start()` lifecycle order:
1. Configure root container (`withContainerConfiguration` hooks)
2. Load all modules (lazy factories resolved in parallel)
3. Configure each module's child container (`module.configureContainer`)
4. Run app-level `withInitialisation` hooks (sequential, fatal on error)
5. Run `module.initialise()` on all modules (parallel, failures isolated)
6. Run `module.start()` on all modules (parallel, failures isolated)
7. Run app-level `withStart` hooks (sequential, fatal on error)

### `ModuleBuilder`

Declares a module's container registrations, view bindings, and lifecycle hooks:

```typescript
import { ModuleBuilder } from 'esp-js-ui';

export const ordersModule = ModuleBuilder
    .create('orders')
    .withContainerConfiguration((container) => {
        container.register('ordersService', OrdersService).inject('bus').singleton();
    })
    .withView('orders-store', OrdersView, 'main')    // storeId, Component, regionName
    .withView('orders-summary', SummaryView, 'sidebar')
    .withInitialisation(async (app) => {
        const svc = app.container.resolve('ordersService');
        app.eventBus.storeBuilder<OrdersState>('orders-store', new OrdersState())
            .withEventHandler(/* ... */)
            .build();
    })
    .withStart(async (app) => {
        app.eventBus.publishEvent('orders-store', 'AppStarted', {});
    })
    .build();
```

Each module gets its own child container (child of the root). Modules can see root registrations but the root cannot see module registrations.

### Removed from `esp-js-ui`

The old `esp-js-ui` exported OO base classes and decorators for module loading. All of these are removed. The old package depended on RxJS and had a complex multi-step registration ceremony. The new `esp-js-ui` has no RxJS dependency and is built entirely on the fluent builder pattern.

---

## esp-js-react — new components and API

### New: `EspApp`

The recommended root wrapper. Wrap the application after `app.start()` resolves:

```tsx
await app.start();
ReactDOM.createRoot(document.getElementById('root')).render(
    <EspApp app={app}>
        <AppShell />
    </EspApp>
);
```

`EspApp` sets up `EspEventBusContextProvider` (with `app.eventBus`) and `EspModulesContext` (with `app.modules`).

### New: `RegionView`

Renders all views registered to a named region by loaded modules (via `ModuleBuilder.withView(storeId, Component, region)` in `esp-js-ui`):

```tsx
const AppShell = () => (
    <div>
        <RegionView regionName="main" />
        <RegionView regionName="sidebar" />
    </div>
);
```

`RegionView` reads `EspModulesContext`, finds all `ModuleViewBinding` entries matching `regionName`, and mounts a `ConnectableComponent` for each. Requires `EspApp` (or manual `EspModulesContext.Provider`) above it.

### Renamed: `EspModelContextProvider` → `EspStoreContextProvider`

All model-scoped context APIs have been renamed to use the `store` terminology:

| v8 | v9 |
|---|---|
| `EspModelContextProvider` | `EspStoreContextProvider` |
| `useGetModel` | `useGetStore` |
| `useGetModelId` | `useGetStoreId` |
| `usePublishModelEvent` | `usePublishStoreEvent` |
| `usePublishModelEventWithEntityKey` | `usePublishStoreEventWithEntityKey` |

### Renamed context options: `modelId` → `storeId`

`syncModelWithSelectorOptions()` option `.setModelId()` is renamed `.setStoreId()`.

### `useSyncModelWithSelector` — removed option

`tryPreSelectPolimerImmutableModel` has been removed from `SyncModelWithSelectorOptions`. This option previously called `model.getEspPolimerImmutableModel()` before applying the selector. Since the model is now the direct frozen snapshot from immer, no pre-selection is necessary.

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
    .setStoreId('my-store')
    .build()
```

### `ConnectableComponent` — duck-typing removed

`ConnectableComponent` previously checked for `getEspPolimerImmutableModel` on the model and unwrapped it before passing to `mapModelToProps`. This duck-typing is removed. The raw frozen model is passed directly.

`ConnectableComponent` now requires an explicit `view` prop — there is no decorator-based view resolution in v9.

### `@viewBinding` decorator — removed

The `@viewBinding` decorator and associated `ViewBinder`, `createViewForModel`, `DEFAULT_VIEW_KEY`, and `viewContext` are removed. View registration is now done via `ModuleBuilder.withView(storeId, Component, regionName)` in `esp-js-ui`.

### Reactive API internalized

The `reactive/` module in `esp-js` is now internal-only and is not exported from `src/index.ts`. `Observable`, `Subject`, `RouterObservable`, and `RouterSubject` are no longer part of the public API.

Code that previously used `Observable.create` to wrap `bus.getModelObservable()` must be updated to wrap the `subscribe` method directly:

```typescript
// Before (broken — Observable is no longer exported):
const wrapped = Observable.create<MyModel>(o => bus.getModelObservable('id').subscribe(o));

// After:
const upstream = bus.getModelObservable<MyModel>('id');
const wrapped = {
    subscribe(observer: any) {
        return upstream.subscribe(observer);
    }
} as Subscribable<MyModel>;
```

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
interface CounterState {
    count: number;
}

const bus = new EventBus();

bus.storeBuilder<CounterState>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, event: { amount: number }) => {
        draft.count += event.amount;
    })
    .build();

bus.getModelObservable<CounterState>('counter').subscribe(m => render(m));
bus.publishEvent('counter', 'Increment', { amount: 1 });
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
bus.publishEvent('my-store', 'SetFlag', { flag: true });

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
bus.storeBuilder<MyState>('my-store', initialState)
    .withPreEventProcessor(m => console.log('before', m))
    .withPostEventProcessor((m, events) => console.log('after', events))
    .build();
```

### Replacing effects / async side effects

**Before (v8, with polimer):** Used `@eventTransformFor` returning an RxJS observable.

**After (v9):** Use `withEffect` for synchronous follow-on events. For async work (HTTP, WebSocket), use `withEventSubscription` to wire an external source, or publish an event from an effect and handle the async response via a subscription factory.

```typescript
.withEffect('FetchUser', (model, event, ctx, publish) => {
    fetchUser(event.userId).then(user => publish('UserLoaded', { user }));
})
```

### Replacing OO esp-js-ui module system

**Before (old esp-js-ui):** Modules extended a base class and used decorators to register views.

**After (v9):** Use `ModuleBuilder` and `AppBuilder`:

```typescript
// Define a module
export const myModule = ModuleBuilder
    .create('my-module')
    .withContainerConfiguration(container => { /* register services */ })
    .withView('my-store', MyView, 'main')
    .withInitialisation(async (app) => {
        app.eventBus.storeBuilder<MyState>('my-store', new MyState())
            .withEventHandler(/* ... */)
            .build();
    })
    .build();

// Bootstrap
const app = AppBuilder.create('my-app').withModule(myModule).build();
await app.start();

ReactDOM.createRoot(root).render(
    <EspApp app={app}>
        <RegionView regionName="main" />
    </EspApp>
);
```

---

## esp-js-polimer removal

`esp-js-polimer` has been **deleted** from the monorepo. The package is no longer published.

Polimer's concepts — immutable state, immer drafts, builder registration, event transforms — are the direct ancestors of the v9 `esp-js` API. The `StoreBuilder` in `esp-js` is the replacement.

Migration reference:

| esp-js-polimer | esp-js v9 |
|---|---|
| `PolimerModelBuilder` | `StoreBuilder` / `bus.storeBuilder()` |
| `withStateHandlers(key, handlers)` (per-slice) | `withEventHandler` on the full model |
| `@eventTransformFor` (RxJS observable transforms) | `withEffect` + `withEventSubscription` |
| `PolimerModel.getImmutableModel()` | `bus.getModelObservable()` — emits the POJO directly |
