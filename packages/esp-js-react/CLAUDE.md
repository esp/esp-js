# esp-js-react

## Package Purpose

React bindings for ESP. Provides two complementary integration approaches: the `ConnectableComponent`/`connect()` HOC pattern and the `useSyncModelWithSelector` hook. Also provides React context providers for the `Router` and model.

## Role in Monorepo

- **Depends on**: `esp-js`, `react`, `use-sync-external-store`
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
  index.ts                      # Public exports
  connectableComponent.tsx      # ConnectableComponent — HOC that subscribes to router model
  connect.tsx                   # connect() factory — creates typed ConnectableComponentFactory
  espRouterContextProvider.tsx  # RouterProvider, EspRouterContextProvider, useRouter, usePublishEvent
  espModelContextProvider.tsx   # EspModelContextProvider, useGetModel, useGetModelId, usePublishModelEvent
  useSyncModelWithSelector.ts   # useSyncModelWithSelector hook + SyncModelWithSelectorOptions
```

## Key Concepts and Patterns

### Router Context

Wrap the application (or subtree) with `EspRouterContextProvider` to make the router available via context:

```tsx
<EspRouterContextProvider router={router}>
    <App />
</EspRouterContextProvider>
```

Access the router in any descendant:
```tsx
const router = useRouter();
const publishEvent = usePublishEvent(); // (modelId, eventType, event) => void
```

### ConnectableComponent / connect()

The legacy (but fully supported) HOC approach. Subscribe a view to a model by `modelId`:

```tsx
const MyConnectedView = connect<MyModel, MyPublishProps>(
    (model) => ({ items: model.orders.items }),           // mapModelToProps
    (publishEvent) => ({ onAdd: (item) => publishEvent('OrderAdded', { item }) }) // createPublishEventProps
)(MyView);

// Usage:
<MyConnectedView modelId="my-model" />
```

`ConnectableComponent` subscribes to `router.getModelObservable(modelId)` and re-renders when the model updates.

### useSyncModelWithSelector

Hook-based approach using React 18's `useSyncExternalStore`. The model emitted by the router is always a frozen immutable snapshot (produced by immer via `ModelBuilder`) — no unwrapping required.

```tsx
const orders = useSyncModelWithSelector<OrdersState>(
    model => model.orders,
    syncModelWithSelectorOptions<OrdersState>()
        .setModelId('my-model')
        .setEqualityFn((a, b) => a.items === b.items)
        .build()
);
```

### EspModelContextProvider

For cases where a subtree shares a single `modelId`:

```tsx
<EspModelContextProvider modelId="my-model">
    <ChildComponent />
</EspModelContextProvider>
```

In a child:
```tsx
const model = useGetModel<MyModel>();
const publishEvent = usePublishModelEvent(); // no modelId needed
```

## Public API

```typescript
// HOC approach
export { connect, ConnectableComponentFactory }
export { ConnectableComponent, ConnectableComponentProps, MapModelToProps, CreatePublishEventProps, ConnectableComponentChildProps }

// Hook approach
export { useSyncModelWithSelector, SyncModelWithSelectorOptionsBuilder, syncModelWithSelectorOptions, SyncModelWithSelectorOptions, SyncModelWithSelectorEqualityFn }

// Router context
export { RouterProvider, EspRouterContextProvider, RouterContext, useRouter, PublishEventDelegate, PublishEventContext, usePublishEvent }

// Model context
export { EspModelContextProvider, useGetModelId, useGetModel, usePublishModelEvent, usePublishModelEventWithEntityKey, GetModelIdContext, GetModelContext, PublishModelEventDelegate, PublishModelEventContext, PublishModelEventWithEntityKeyDelegate, PublishModelEventWithEntityKeyContext }
```

## Testing Approach

- Test files: `tests/**/*Tests.tsx`
- Uses `@testing-library/react` for rendering and interaction
- `tests/testApi/` — shared test fixtures including mock router and model helpers
  - `testModel.ts` — `createTestModel(router, modelId)` registers a model via `ModelBuilder`
  - `testApi.tsx` — `setupTestModel(modelId)` and `setupModel(modelId, model)` helpers
  - `routerSpy.ts` — `RouterSpy extends Router`, wraps `getModelObservable()` to count subscriptions (does **not** use `Observable.create` — reactive module is internal)
- Notable test files:
  - `connectableComponentTests.tsx` — HOC subscription and re-render behaviour; models use `[immerable] = true`
  - `useSyncModelWithSelectorTests.tsx` — hook selector and equality function behaviour
  - `espModelContextProviderTests.tsx`, `espRouterContextProviderTests.tsx` — context hook tests; use `router.getModel()` to read current snapshot after events

## Common Tasks

**Minimal setup with hooks:**
```tsx
function App() {
    return (
        <EspRouterContextProvider router={router}>
            <EspModelContextProvider modelId="counter">
                <CounterView />
            </EspModelContextProvider>
        </EspRouterContextProvider>
    );
}

function CounterView() {
    const model = useGetModel<CounterModel>();
    const publish = usePublishModelEvent();
    return <button onClick={() => publish('Increment', { amount: 1 })}>{model?.count}</button>;
}
```

**HOC with connect():**
```tsx
const ConnectedView = connect<MyModel, { onSubmit: () => void }>(
    m => ({ title: m.title }),
    (pub) => ({ onSubmit: () => pub('Submit', {}) })
)(MyView);
```

## Gotchas

- The output bundle is named `esp-react.js` (not `esp-js-react.js`) — this is intentional and matches the `main` field in `package.json`
- `useSyncModelWithSelector` uses `useSyncExternalStoreWithSelector` — requires React 18 or the `use-sync-external-store` shim
- `ConnectableComponent` re-renders on every model update regardless of selector — for performance-sensitive cases prefer `useSyncModelWithSelector` with an equality function
- `ConnectableComponent` requires an explicit `view` prop — there is no decorator-based view resolution in v9
- The model received by hooks and `ConnectableComponent` is always a **frozen immutable snapshot** from immer — never mutate it directly, and do not hold references across dispatches (the reference becomes stale)
- Class instances used as model state must include `[immerable] = true` from `immer`

**Removed in v9:** `@viewBinding`, `ViewBinder`, `createViewForModel`, `DEFAULT_VIEW_KEY`, `viewContext` — the OO decorator-based view binding pattern is gone.
