# esp-js-ui

## Package Purpose

Application bootstrapping and module loading for ESP applications. Provides `AppBuilder` and `ModuleBuilder` — fluent builders that replace OO inheritance and decorator patterns from earlier versions. Manages the root IoC container, module lifecycle (configure → initialise → start → dispose), and view-region bindings.

## Role in Monorepo

- **Depends on (peer)**: `esp-js`, `esp-js-di`
- **Direct dependents**: `esp-js-react` (peer dep)
- Published as `esp-js-ui` on npm

## Build and Test

```bash
npm run build-dev      # vite build → .dist/esp-js-ui.js + .dist/esp-js-ui.esm.mjs
npm run build-prod     # adds .dist/esp-js-ui.min.js (minified UMD)
npm test               # vitest --watch
npm run test-ci        # vitest run (CI)
npm run dev            # vite build --watch
```

Output: `.dist/esp-js-ui.js` (UMD), `.dist/esp-js-ui.esm.mjs` (ESM), `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  index.ts                    # Public exports
  app/
    appBuilder.ts             # AppBuilder — fluent builder for the App
    defaultApp.ts             # DefaultApp implements App — runs lifecycle
    types.ts                  # App interface
  modules/
    moduleBuilder.ts          # ModuleBuilder — fluent builder for a Module
    defaultModule.ts          # DefaultModule implements Module
    types.ts                  # Module, ModuleViewBinding, ModuleFactory, ModuleOrFactory
```

## Key Concepts and Patterns

### AppBuilder

Creates a fully bootstrapped application with an `EventBus` and root IoC container.

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

**`app.start()` lifecycle order:**
1. Configure root container (`withContainerConfiguration` hooks)
2. Load all modules (lazy factories resolved in parallel)
3. Configure each module's child container (`module.configureContainer`)
4. Run app-level `withInitialisation` hooks (sequential, fatal on error)
5. Run `module.initialise()` on all modules (parallel, failures isolated)
6. Run `module.start()` on all modules (parallel, failures isolated)
7. Run app-level `withStart` hooks (sequential, fatal on error)

`app.start()` is idempotent — subsequent calls are no-ops. `app.dispose()` disposes all modules in reverse load order (each disposes its child container), then the `EventBus` (and its stores), then the root container. `start()` throws after `dispose()`.

The `EventBus` is pre-registered in the root container as `'bus'`.

### ModuleBuilder

Declares a module's container registrations, view bindings, and lifecycle hooks.

```typescript
import { ModuleBuilder } from 'esp-js-ui';

export const ordersModule = ModuleBuilder
    .create('orders')
    .withContainerConfiguration((container) => {
        container.register('ordersService', OrdersService).inject('bus').singleton();
    })
    .withView('orders-store', OrdersView, 'main')   // storeId, Component, regionName
    .withView('orders-summary', SummaryView, 'sidebar')
    .withInitialisation(async ({ moduleContainer, eventBus }) => {
        // ordersService is in this module's own child container
        const svc = moduleContainer.resolve<OrdersService>('ordersService');
        registerOrdersStore(eventBus, svc, 'orders-store');
    })
    .withStart(async ({ eventBus }) => {
        eventBus.publishEvent('orders-store', 'AppStarted', {});
    })
    .build();
```

**`ModuleContext`** — what module `withInitialisation` / `withStart` hooks receive:
- `app` — the `App`
- `moduleContainer` — the module's own child container (sees root registrations like `'bus'`; root and other modules can't see it)
- `eventBus` — the app's `EventBus` (same as `app.eventBus`)

App-level `AppBuilder.withInitialisation` / `withStart` hooks still receive the `App`.

**`ModuleViewBinding`** — what `withView` records:
- `storeId` — the EventBus store ID this view subscribes to
- `viewComponent` — the React component to render
- `region` — a string token identifying the shell slot (consumed by `RegionView` in `esp-js-react`)

### Module interface

The `Module` interface (implemented by `DefaultModule`):

```typescript
interface Module {
    readonly moduleId: string;
    readonly viewBindings: ReadonlyArray<ModuleViewBinding>;
    configureContainer(container: Container): void;
    initialise(app: App): Promise<void>;   // builds a ModuleContext and runs the withInitialisation hooks
    start(app: App): Promise<void>;        // builds a ModuleContext and runs the withStart hooks
    dispose(): void;                       // disposes the module's child container
}
```

### Lazy module loading

Modules can be registered as async factory functions for code splitting:

```typescript
AppBuilder.create('my-app')
    .withModule(async () => import('./heavyModule').then(m => m.heavyModule))
    .build();
```

Factories are resolved in parallel during `app.start()`.

## Public API

```typescript
export { AppBuilder }
export type { App }

export { ModuleBuilder }
export type { Module, ModuleContext, ModuleHook, ModuleViewBinding, ModuleLoadResult, ModuleFactory, ModuleOrFactory }
```

## Gotchas

- `AppBuilder.build()` is one-shot — calling `build()` twice throws. Same for `ModuleBuilder.build()`.
- `app.start()` is idempotent — safe to call multiple times, but only the first call does work.
- Module `initialise` and `start` failures are isolated (caught and logged) — they do not abort the lifecycle. App-level `withInitialisation` and `withStart` failures are fatal.
- The `EventBus` instance is created inside `DefaultApp` — you do not pass one in. Access it via `app.eventBus`; it exists as soon as the app is built, before `start()`.
- Each module gets its own child container (child of the root container). Modules can see root registrations but root cannot see module registrations. Resolve module services via `moduleContainer` from the `ModuleContext`, **not** `app.container` (that's the root).
- `app.dispose()` also disposes the `EventBus` and root container — don't keep using either afterwards.
- `withView` records metadata only — rendering is the caller's responsibility (done by `RegionView` in `esp-js-react`, or manually).
