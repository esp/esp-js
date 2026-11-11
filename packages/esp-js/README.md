[![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
![npm type definitions](https://img.shields.io/npm/types/esp-js)

# Evented State Processor (ESP) — esp-js

`esp-js` is the core of ESP: the `EventBus` and the immer-based `StoreBuilder`.

ESP lets you manage changes to a store's state in a deterministic, event-driven manner.
A central `EventBus` sits between event publishers and your stores: publishers publish events to the bus, the bus dispatches each event through ordered observation stages so the store can apply the change, and then a frozen immutable snapshot of the store's model is pushed to its observers.
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

type Counter = { count: number };

bus.storeBuilder<Counter>('counter', { count: 0 })
    .withEventHandler('Increment', (draft, e: { by: number }) => {
        draft.count += e.by;
    })
    .withPreviewHandler('Increment', (model, e, ctx) => {
        if (model.count >= 100) ctx.cancel();   // observe/cancel before mutation
    })
    .withEffect('Increment', (model, e, ctx, publish) => {
        // side effects after mutation; `model` is a frozen snapshot taken right after this event
        if (model.count === 10) publish('Increment', { by: -10 });
    })
    .build();

bus.getStoreModelObservable<Counter>('counter')
    .subscribe(model => console.log(model.count)); // logs: 0 (the current model is replayed on subscribe)

bus.publishEvent('counter', 'Increment', { by: 1 }); // logs: 1
```

Events pass through up to four ordered observation stages — `preview`, `normal`, `committed`, `final`.
Events an effect publishes straight away to its own store are processed before observers are notified, so they get a single model update.
Publishing an event the store has no handler for logs a warning.
A class instance used as store state must include `[immerable] = true` from `immer`.

## The ESP package family

* **esp-js** — the core `EventBus` and `StoreBuilder` (this package)
* **esp-js-di** — a standalone IoC / dependency-injection container [![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
* **esp-js-ui** — application bootstrapping and module loading [![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
* **esp-js-react** — React bindings [![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

Written in TypeScript; type definitions are included in the package.

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
