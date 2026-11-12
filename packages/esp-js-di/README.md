[![npm](https://img.shields.io/npm/v/esp-js-di.svg)](https://www.npmjs.com/package/esp-js-di)
![npm type definitions](https://img.shields.io/npm/types/esp-js-di)

# Evented State Processor (ESP) — esp-js-di

`esp-js-di` is a small, standalone IoC (Inversion of Control) / dependency-injection container (formerly `microdi-js`).
It supports singleton and transient lifetimes, child containers, named injection, registration groups, and runtime circular-dependency detection.

It is used internally by `esp-js-ui` to manage per-application and per-module service lifetimes, but has no dependency on the rest of ESP and can be used entirely on its own.

## Install

```bash
npm install esp-js-di
```

## Usage

```ts
import { Container } from 'esp-js-di';

const container = new Container();

// Registrations are singletons by default — call .transient() for per-resolve instances.
container.register('bus', EventBus).singleton();
container.register('ordersService', OrdersService).inject('bus').singleton();

const ordersService = container.resolve('ordersService');

// Resolve several at once into a keyed object (destructure-friendly):
const { bus, ordersService: svc } = container.resolveMany('bus', 'ordersService');

// Child containers inherit the parent's registrations and can shadow them:
const child = container.createChildContainer();
child.register('ordersService', SpecialOrdersService).singleton();
child.dispose(); // disposes the child's singletons; the parent is untouched
```

Both import styles are supported:

```ts
import { Container } from 'esp-js-di';   // named export
import di from 'esp-js-di';              // default export — di.Container
```

The source is JavaScript; hand-written TypeScript declarations ship with the package.

## The ESP package family

* **esp-js** — the core `EventBus` and `StoreBuilder` [![npm](https://img.shields.io/npm/v/esp-js.svg)](https://www.npmjs.com/package/esp-js)
* **esp-js-di** — a standalone IoC / dependency-injection container (this package)
* **esp-js-ui** — application bootstrapping and module loading [![npm](https://img.shields.io/npm/v/esp-js-ui.svg)](https://www.npmjs.com/package/esp-js-ui)
* **esp-js-react** — React bindings [![npm](https://img.shields.io/npm/v/esp-js-react.svg)](https://www.npmjs.com/package/esp-js-react)

For full documentation see [https://esp.github.io/](https://esp.github.io/), or browse the source at [github.com/esp/esp-js](https://github.com/esp/esp-js).
