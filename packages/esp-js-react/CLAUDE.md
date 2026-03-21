# esp-js-react

## Package Purpose

React bindings for ESP. Provides two complementary integration approaches: the `ConnectableComponent`/`connect()` HOC pattern (class-based or functional) and the `useSyncModelWithSelector` hook. Also provides `@viewBinding` decorator for declarative model-to-view mapping, React context providers for the `Router`, and polimer model builder extensions.

## Role in Monorepo

- **Depends on**: `esp-js`, `esp-js-polimer`, `react`, `prop-types`, `use-sync-external-store`
- Depended on by: `esp-js-ui`
- Published as `esp-js-react` on npm

## Build and Test

```bash
npm run build-dev
npm run build-prod  # output: .dist/esp-react.js  (note: filename is esp-react, not esp-js-react)
npm test            # jest --watchAll
npm run test-ci     # jest (CI)
```

Output: `.dist/esp-react.js`, `.dist/typings/index.d.ts`.

Note: the webpack entry and output filename is `esp-react` (see `webpack.config.js`), not `esp-js-react`.

## Source Structure

```
src/
  index.ts                      # Public exports
  connectableComponent.tsx      # ConnectableComponent — HOC that subscribes to router model
  connect.tsx                   # connect() factory — creates typed ConnectableComponentFactory
  espRouterContextProvider.tsx  # RouterProvider, EspRouterContextProvider, useRouter, usePublishEvent
  espModelContextProvider.tsx   # EspModelContextProvider, useGetModel, useGetModelId, usePublishModelEvent
  useSyncModelWithSelector.ts   # useSyncModelWithSelector hook + SyncModelWithSelectorOptions
  viewBinder.tsx                # ViewBinder component — renders view for a model using @viewBinding metadata
  viewBindingDecorator.ts       # @viewBinding decorator + createViewForModel utility
  polimer/
    polimerModelBuilderExtentsions.ts  # Side-effect import: extends Router.getModelObservable for PolimerModel unwrapping
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

Hook-based approach using React 18's `useSyncExternalStore`:

```tsx
const orders = useSyncModelWithSelector<OrdersState>(
    model => model.orders,
    syncModelWithSelectorOptions<OrdersState>()
        .setModelId('my-model')
        .setEqualityFn((a, b) => a.items === b.items)
        .build()
);
```

If the model is a `PolimerModel`, `tryPreSelectPolimerImmutableModel: true` (default) automatically calls `getImmutableModel()` before passing to the selector.

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

### @viewBinding decorator

Declaratively associates a React component with a model class:

```typescript
@viewBinding(MyView)
@viewBinding(MyCompactView, 'compact') // with display context
class MyModel extends ModelBase { ... }
```

`createViewForModel(model, props, displayContext, fallbackView)` resolves the right component. `ViewBinder` renders it.

### Polimer extensions (side effect)

Importing `esp-js-react` triggers `polimer/polimerModelBuilderExtentsions.ts` which patches the `Router`'s model observation to automatically unwrap `PolimerModel` instances — model observers receive the `ImmutableModel` directly rather than the `PolimerModel` wrapper.

## Public API

```typescript
// HOC / class component approach
export { ViewBinder }
export { viewBinding, DEFAULT_VIEW_KEY, createViewForModel }
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
- Notable test files:
  - `connectableComponentTests.tsx` — HOC subscription and re-render behaviour
  - `useSyncModelWithSelectorTests.tsx` — hook selector and equality function behaviour
  - `espModelContextProviderTests.tsx`, `espRouterContextProviderTests.tsx` — context hook tests
  - `viewBinderTests.tsx` — `@viewBinding` resolution logic

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

**Add @viewBinding to a model:**
```typescript
import { viewBinding } from 'esp-js-react';

@viewBinding(MyReactComponent)
class MyModel extends ModelBase { ... }
```

## Gotchas

- The output bundle is named `esp-react.js` (not `esp-js-react.js`) — this is intentional and matches the `main` field in `package.json`
- The polimer builder extensions in `polimer/polimerModelBuilderExtentsions.ts` are applied as a **side effect on import** — if you import only specific named exports and tree-shaking removes this module, polimer model observation may not work correctly; import from the package index to be safe
- `useSyncModelWithSelector` uses `useSyncExternalStoreWithSelector` from React 18 — requires React 18 or the `use-sync-external-store` shim
- `ConnectableComponent` re-renders on every model update regardless of selector — for performance-sensitive cases prefer `useSyncModelWithSelector` with an equality function
- `@viewBinding` metadata is stored on the **constructor function**, not the instance — `createViewForModel` must receive the model instance (it reads `model.constructor`)
