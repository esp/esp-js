[![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)
![npm type definitions](https://img.shields.io/npm/types/esp-js-react)

# Evented State Processor (ESP) — esp-js-react

`esp-js-react` provides the React bindings for ESP.
It connects React views to ESP stores and re-renders them as new immutable model snapshots are pushed from the `EventBus`.

Key building blocks:

* `EspApp` — wraps the app root with the EventBus and modules contexts
* `RegionView` — renders the views that loaded modules registered for a named region
* `ConnectableComponent` — subscribes a view to a store by `storeId`
* hooks — `useSyncModelWithSelector`, `usePublishStoreEvent`, `useGetStore`, `useEventBus`, and more

> Peer dependencies: `esp-js`, `esp-js-ui` and `react` (19).

## Install

```bash
npm install esp-js-react esp-js esp-js-ui react
```

## Usage

With `esp-js-ui`, wrap the app after `app.start()` resolves and let regions render module views:

```tsx
import { EspApp, RegionView, usePublishStoreEvent } from 'esp-js-react';

// after app.start():
ReactDOM.createRoot(document.getElementById('root')!).render(
    <EspApp app={app}>
        <RegionView regionName="main" />
    </EspApp>
);

// A view receives the current model snapshot as a prop and publishes events back to its store:
function OrdersView({ model }: { model: OrdersStore }) {
    const publish = usePublishStoreEvent(); // (eventType, event) => void — storeId is inferred from context
    return <button onClick={() => publish('AddOrder', {})}>{model.title}</button>;
}
```

You can also connect a single view directly, without the module/region machinery:

```tsx
import { EspEventBusContextProvider, ConnectableComponent } from 'esp-js-react';

<EspEventBusContextProvider bus={bus}>
    <ConnectableComponent storeId="counter" view={CounterView} />
</EspEventBusContextProvider>
```

The model handed to views and hooks is always a frozen immutable snapshot — never mutate it directly.
For fine-grained re-rendering, prefer `useSyncModelWithSelector` with a selector and equality function.

> The published bundle is named `esp-react.js` (matching the `main` field), not `esp-js-react.js`.

## The ESP package family

* **esp-js** — the core `EventBus` and `StoreBuilder` [![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
* **esp-js-di** — a standalone IoC / dependency-injection container [![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
* **esp-js-ui** — application bootstrapping and module loading [![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
* **esp-js-react** — React bindings (this package)

Written in TypeScript; type definitions are included in the package.

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
