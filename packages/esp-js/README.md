[![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
![npm type definitions](https://img.shields.io/npm/types/esp-js)

# Evented State Processor (ESP) — esp-js

`esp-js` is the core of ESP: the `EventBus` and the immer-based `StoreBuilder`.

ESP lets you manage changes to a store's state in a deterministic, event-driven manner.
A central `EventBus` sits between event publishers and your stores: publishers publish events to the bus, the bus dispatches each event through ordered observation stages so the store can apply the change, and then a frozen immutable snapshot of the store is pushed to its observers.
It's lightweight, easy to apply, and designed for complex UI and/or server state.

## Install

```bash
npm install esp-js
```

## Usage

Register a store with `storeBuilder`, then publish events to it. Event handlers receive an [immer](https://immerjs.github.io/immer/) draft and mutate it directly; the bus produces a new frozen snapshot after all handlers for a dispatch have run.

```ts
import { EventBus } from 'esp-js';

const bus = new EventBus();

type CounterStore = { count: number };

bus.storeBuilder<CounterStore>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, e: { by: number }) => {
        draft.count += e.by;
    })
    .withPreviewHandler('Increment', (store, e, ctx) => {
        if (store.count >= 100) ctx.cancel();   // observe/cancel before mutation
    })
    .withEffect('Increment', (store, e, ctx, publish) => {
        publish('Logged', { count: store.count }); // side effects after mutation
    })
    .build();

bus.getModelObservable<CounterStore>('counter')
    .subscribe(store => console.log(store.count));

bus.publishEvent('counter', 'Increment', { by: 1 }); // logs: 1
```

Events pass through up to four ordered observation stages — `preview`, `normal`, `committed`, `final`.
A class instance used as store state must include `[immerable] = true` from `immer`.

## The ESP package family

* **esp-js** — the core `EventBus` and `StoreBuilder` (this package)
* **esp-js-di** — a standalone IoC / dependency-injection container [![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
* **esp-js-ui** — application bootstrapping and module loading [![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
* **esp-js-react** — React bindings [![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

Written in TypeScript; type definitions are included in the package.

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
