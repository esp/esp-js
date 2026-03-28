# esp-js-react

## Package Purpose

React bindings for ESP. Provides `ConnectableComponent` for subscribing views to stores, `RegionView` for rendering module-declared views into named shell regions, `EspApp` for wrapping the app root with all required contexts, and hooks (`useSyncModelWithSelector`, `usePublishStoreEvent`, etc.) for fine-grained model access.

## Role in Monorepo

- **Depends on (peer)**: `esp-js`, `esp-js-ui`, `react`
- **Runtime dependency**: `use-sync-external-store`
- Published as `esp-js-react` on npm

## Build and Test

```bash
npm run build-dev   # vite build → .dist/esp-react.js + .dist/esp-react.esm.js
npm run build-prod  # adds .dist/esp-react.min.js (minified UMD)
npm test            # vitest --watch
npm run test-ci     # vitest run (CI)
npm run dev         # vite build --watch
```

Output: `.dist/esp-react.js` (UMD), `.dist/esp-react.esm.js` (ESM), `.dist/typings/index.d.ts`.

Note: the Vite entry and output filename is `esp-react` (see `vite.config.ts`), not `esp-js-react`.

## Source Structure

```
src/
  index.ts                       # Public exports
  connectableComponent.tsx       # ConnectableComponent — subscribes to a store; wraps view in EspStoreContextProvider
  espEventBusContextProvider.tsx # EspEventBusContextProvider, EventBusContext, useEventBus, usePublishEvent
  espStoreContextProvider.tsx    # EspStoreContextProvider, useGetStore, useGetStoreId, usePublishStoreEvent, usePublishStoreEventWithEntityKey
  espApp.tsx                     # EspApp — wraps app root with EventBus + modules contexts
  regionView.tsx                 # RegionView — renders module views registered to a named region
  espModulesContext.ts           # EspModulesContext — React context holding loaded Module[]
  useSyncModelWithSelector.ts    # useSyncModelWithSelector hook + SyncModelWithSelectorOptions
```

## Key Concepts and Patterns

### EspApp

The recommended root wrapper. Wrap the application after `app.start()` resolves:

```tsx
await app.start();
ReactDOM.createRoot(document.getElementById('root')).render(
    <EspApp app={app}>
        <AppShell />
    </EspApp>
);
```

`EspApp` sets up `EspEventBusContextProvider` (with `app.eventBus`) and `EspModulesContext` (with `app.modules`) — no manual setup needed.

### RegionView

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

### EventBus Context

Access the bus in any descendant of `EspApp` or `EspEventBusContextProvider`:
```tsx
const bus = useEventBus();
const publishEvent = usePublishEvent(); // (storeId, eventType, event) => void
```

### ConnectableComponent

Subscribes a view to a store by `storeId`. Re-renders on every model update. Also sets up `EspStoreContextProvider` so child hooks work without explicit `storeId`:

```tsx
<ConnectableComponent
    storeId="my-store"
    view={MyView}
    mapModelToProps={(model) => ({ items: model.items })}
    createPublishEventProps={(publish) => ({ onAdd: (item) => publish('ItemAdded', { item }) })}
/>
```

The view component receives `storeId`, `model`, `bus`, and any mapped props.

### EspStoreContextProvider / Store Hooks

For cases where a subtree shares a single store. Set up by `ConnectableComponent` automatically, or manually:

```tsx
<EspStoreContextProvider storeId="my-store" model={model}>
    <ChildComponent />
</EspStoreContextProvider>
```

In any descendant:
```tsx
const model = useGetStore<MyModel>();
const storeId = useGetStoreId();
const publish = usePublishStoreEvent(); // (eventType, event) => void — no storeId needed
const publishWithKey = usePublishStoreEventWithEntityKey(); // (entityKey, eventType, event) => void
```

### useSyncModelWithSelector

Hook-based subscription using React 18's `useSyncExternalStore`. Supports a selector and equality function to avoid unnecessary re-renders:

```tsx
const items = useSyncModelWithSelector<MyModel, Item[]>(
    model => model.items,
    syncModelWithSelectorOptions<Item[]>()
        .setStoreId('my-store')
        .setEqualityFn((a, b) => a.length === b.length)
        .build()
);
```

`storeId` can be omitted if `EspStoreContextProvider` is above in the tree.

## Public API

```typescript
// App + region
export { EspApp, EspAppProps }
export { RegionView, RegionViewProps }
export { EspModulesContext }

// HOC approach
export { ConnectableComponent, ConnectableComponentProps, MapModelToProps, CreatePublishEventProps, ConnectableComponentChildProps }

// Hook approach
export { useSyncModelWithSelector, syncModelWithSelectorOptions, SyncModelWithSelectorOptionsBuilder, SyncModelWithSelectorOptions, SyncModelWithSelectorEqualityFn }

// EventBus context
export { EspEventBusContextProvider, EspEventBusContextProviderProps, EventBusContext, useEventBus, PublishEventDelegate, PublishEventContext, usePublishEvent }

// Store context
export { EspStoreContextProvider, EspStoreContextProviderProps, GetStoreIdContext, useGetStoreId, GetStoreContext, useGetStore, PublishStoreEventContext, usePublishStoreEvent, PublishStoreEventDelegate, PublishStoreEventWithEntityKeyContext, usePublishStoreEventWithEntityKey, PublishStoreEventWithEntityKeyDelegate }
```

## Testing Approach

- Test files: `tests/**/*Tests.tsx`
- Uses `@testing-library/react` for rendering and interaction
- `tests/testApi/` — shared test fixtures including mock bus and model helpers
  - `testModel.ts` — `createTestModel(bus, storeId)` registers a store via `StoreBuilder`
  - `testApi.tsx` — `setupTestModel(storeId)` and `setupModel(storeId, model)` helpers
  - `eventBusSpy.ts` — `EventBusSpy extends EventBus`, wraps `getModelObservable()` to count subscriptions (does **not** use `Observable.create` — reactive module is internal)
- Notable test files:
  - `connectableComponentTests.tsx` — HOC subscription and re-render behaviour; models use `[immerable] = true`
  - `useSyncModelWithSelectorTests.tsx` — hook selector and equality function behaviour
  - `espStoreContextProviderTests.tsx`, `espEventBusContextProviderTests.tsx` — context hook tests; use `bus.getModel()` to read current snapshot after events

## Common Tasks

**Minimal setup with EspApp + RegionView (recommended):**
```tsx
// After app.start():
ReactDOM.createRoot(root).render(
    <EspApp app={app}>
        <RegionView regionName="main" />
    </EspApp>
);

// View component — receives model prop from ConnectableComponent:
function MyView({ model }: { model: MyModel }) {
    const publish = usePublishStoreEvent();
    return <button onClick={() => publish('DoThing', {})}>{model.title}</button>;
}
```

**Manual setup with ConnectableComponent:**
```tsx
function App() {
    return (
        <EspEventBusContextProvider bus={bus}>
            <ConnectableComponent storeId="counter" view={CounterView} />
        </EspEventBusContextProvider>
    );
}
```

**useSyncModelWithSelector with EspStoreContextProvider:**
```tsx
<EspStoreContextProvider storeId="counter">
    <CounterView />
</EspStoreContextProvider>

function CounterView() {
    const count = useSyncModelWithSelector<CounterModel, number>(m => m.count);
    const publish = usePublishStoreEvent();
    return <button onClick={() => publish('Increment', { amount: 1 })}>{count}</button>;
}
```

## Gotchas

- The output bundle is named `esp-react.js` (not `esp-js-react.js`) — this is intentional and matches the `main` field in `package.json`
- `useSyncModelWithSelector` uses `useSyncExternalStoreWithSelector` — requires React 18 or the `use-sync-external-store` shim
- `ConnectableComponent` re-renders on every model update regardless of selector — for performance-sensitive cases prefer `useSyncModelWithSelector` with an equality function
- `ConnectableComponent` requires an explicit `view` prop — there is no decorator-based view resolution in v9
- The model received by hooks and `ConnectableComponent` is always a **frozen immutable snapshot** from immer — never mutate it directly, and do not hold references across dispatches
- Class instances used as model state must include `[immerable] = true` from `immer`
- `RegionView` requires `EspModulesContext` to be populated — use `EspApp` or provide `EspModulesContext.Provider` manually
- `usePublishStoreEvent` / `useGetStore` / `useGetStoreId` require `EspStoreContextProvider` (or `ConnectableComponent`) above them in the tree

**Removed in v9:** `@viewBinding`, `ViewBinder`, `createViewForModel`, `DEFAULT_VIEW_KEY`, `viewContext` — OO decorator-based view binding is gone. `EspModelContextProvider`, `useGetModel`, `useGetModelId`, `usePublishModelEvent`, `usePublishModelEventWithEntityKey` — renamed to `EspStoreContextProvider`, `useGetStore`, `useGetStoreId`, `usePublishStoreEvent`, `usePublishStoreEventWithEntityKey`.
