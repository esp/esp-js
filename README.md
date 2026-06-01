![npm type definitions](https://img.shields.io/npm/types/esp-js)

# Evented State Processor (ESP)

ESP lets you manage changes to a store's state in a deterministic, event-driven manner.
A central `EventBus` sits between event publishers and your stores: publishers publish events to the bus, the bus dispatches each event through ordered observation stages so the store can apply the change, and then a frozen immutable snapshot of the store is pushed to its observers.
It's lightweight, easy to apply, and designed for complex UI and/or server state — including large composite single-page applications.

## Packages

ESP is published as a family of packages that share a single version:

* **esp-js** — the core `EventBus` and the immer-based `StoreBuilder` [![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
* **esp-js-di** — a standalone IoC / dependency-injection container [![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
* **esp-js-ui** — application bootstrapping and module loading (`AppBuilder`, `ModuleBuilder`) [![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
* **esp-js-react** — React bindings (`EspApp`, `RegionView`, `ConnectableComponent`, hooks) [![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

Everything is written in TypeScript and type definitions are included in each npm package.

## A quick taste

```ts
import { EventBus } from 'esp-js';

const bus = new EventBus();

type CounterStore = { count: number };

bus.storeBuilder<CounterStore>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, e: { by: number }) => {
        draft.count += e.by;           // mutate the immer draft directly
    })
    .build();

bus.getModelObservable<CounterStore>('counter')
    .subscribe(store => console.log(store.count));

bus.publishEvent('counter', 'Increment', { by: 1 }); // logs: 1
```

## This repository

This is the ESP monorepo, managed with npm workspaces and Turborepo, built with Vite and tested with Vitest.

```bash
npm install          # link the workspace packages
npm run build-dev    # build all packages in dependency order
npm test             # run all package test suites
npm run dev          # watch-mode build across all packages
```

The `examples/example-app` directory contains a TodoMVC-style app demonstrating the full stack end to end.

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
