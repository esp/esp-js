[![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
![npm type definitions](https://img.shields.io/npm/types/esp-js-ui)

# Evented State Processor (ESP) — esp-js-ui

`esp-js-ui` provides application bootstrapping and module loading for ESP applications.
It exposes two fluent builders — `AppBuilder` and `ModuleBuilder` — that wire up the root IoC container, the `EventBus`, the module lifecycle (configure → initialise → start → dispose), and view-to-region bindings consumed by `esp-js-react`.

> Peer dependencies: `esp-js` and `esp-js-di`.

## Install

```bash
npm install esp-js-ui esp-js esp-js-di
```

## Usage

A module declares its container registrations, view bindings, and lifecycle hooks.
An app composes modules and runs the whole lifecycle from a single `start()` call.

```ts
import { AppBuilder, ModuleBuilder } from 'esp-js-ui';

const ordersModule = ModuleBuilder.create('orders')
    .withContainerConfiguration(container => {
        container.register('ordersService', OrdersService).inject('bus').singleton();
    })
    .withView('orders-store', OrdersView, 'main')   // storeId, component, region
    .withInitialisation(async app => {
        registerOrdersStore(app.eventBus, 'orders-store');
    })
    .build();

const app = AppBuilder.create('my-app')
    .withModule(ordersModule)
    .withModule(async () => import('./newsModule').then(m => m.newsModule)) // lazy / code-split
    .build();

await app.start();
// app.eventBus, app.container and app.modules are now available.
// The EventBus is created for you and pre-registered in the container as 'bus'.
```

`app.start()` configures the root container, loads modules, runs app- and module-level `initialise` then `start` hooks, and is idempotent.
Each module gets its own child container (a child of the root), so modules can see root registrations but not each other's.

Views are rendered by `esp-js-react` — see `RegionView`, which mounts the views every loaded module registered for a given region.

## The ESP package family

* **esp-js** — the core `EventBus` and `StoreBuilder` [![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
* **esp-js-di** — a standalone IoC / dependency-injection container [![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
* **esp-js-ui** — application bootstrapping and module loading (this package)
* **esp-js-react** — React bindings [![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

Written in TypeScript; type definitions are included in the package.

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
