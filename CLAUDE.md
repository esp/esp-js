# ESP (Evented State Processor) — Monorepo

## Project Overview

ESP is a TypeScript/JavaScript framework for managing model state changes in a deterministic, event-driven manner. A central `Router` sits between event publishers and models: publishers call `router.publishEvent(modelId, eventType, event)`, the router queues and dispatches events through ordered observation stages, and the mutated model is then pushed to model observers. The framework uses [immer](https://immerjs.github.io/immer/) directly in the dispatch loop to produce immutable state snapshots. It is designed for complex composite single-page applications.

The monorepo contains the core router, dependency injection container, React integration, RxJS utilities, a composite-app UI framework, and supporting packages.

## Monorepo Structure

```
packages/
  esp-js              # Core event router — foundational, no dependencies on other esp-* packages
  esp-js-di           # Standalone IoC container (JavaScript, not TypeScript)
  esp-js-metrics      # Pluggable metrics abstraction (prom-client-compatible interface)
  esp-js-polimer      # DEPRECATED in v9 — immer integration moved into esp-js core
  esp-js-react        # React bindings (ConnectableComponent, hooks); depends on esp-js
  esp-js-rx           # RxJS operator utilities; depends on esp-js + rxjs
  esp-js-ui           # Composite app framework (Shell, Module, Region, ViewFactory); depends on most packages
  esp-js-ui-rxcompat  # Legacy RxJS 5/6 compat shims for esp-js-rx; depends on esp-js + esp-js-rx + rxjs-compat
  esp-js-perf-test    # Internal performance benchmarks; private, not published
```

### Package CLAUDE.md files

- @packages/esp-js/CLAUDE.md
- @packages/esp-js-di/CLAUDE.md
- @packages/esp-js-metrics/CLAUDE.md
- @packages/esp-js-polimer/CLAUDE.md
- @packages/esp-js-react/CLAUDE.md
- @packages/esp-js-rx/CLAUDE.md
- @packages/esp-js-ui/CLAUDE.md
- @packages/esp-js-ui-rxcompat/CLAUDE.md
- @packages/esp-js-perf-test/CLAUDE.md

### Dependency graph (simplified)

```
esp-js-di       (no esp deps)
esp-js-metrics  (no esp deps)
esp-js          (no esp deps)
  └── esp-js-rx
  └── esp-js-polimer  (DEPRECATED — use esp-js ModelBuilder directly)
        └── esp-js-react
              └── esp-js-ui  (also depends on esp-js-di, esp-js-metrics, esp-js-rx)
  └── esp-js-ui-rxcompat  (also depends on esp-js-rx)
```

## Monorepo Tooling

- **Package manager**: npm (workspaces)
- **Monorepo orchestration**: Lerna 8 (`lerna.json`)
- **Per-package build scripts**: delegated to `nps` (`package-scripts.js` at root defines shared scripts)
- **Versioning**: Lerna fixed-mode — all packages share the same version (see `lerna.json` for current version)
- **Publishing**: `forcePublish: true` — every package is always published together

### Key root commands

```bash
npm run bootstrap       # npm install — link workspace packages
npm run build-dev       # clean + build all packages in dependency order (dev mode)
npm run build-prod      # clean + build all packages in dependency order (prod mode)
npm test                # run tests in all packages (sorted, streamed)
npm run clean           # clean all .dist and .tsbuild directories
npm run build-pack      # build prod then create .tgz files for each package
npm run trash           # nuclear clean: removes node_modules too (macOS/Linux only)
npm run start-sample    # start esp-js-ui-module-based-app example
```

### Release commands

```bash
npm run release-patch      # build-prod then lerna publish patch
npm run release-minor      # build-prod then lerna publish minor
npm run pre-release-minor  # build-prod then lerna publish preminor --preid next --dist-tag next
```

## Build System

- **Bundler**: Webpack 5 — base config in `webpack.config.base.js`
- **TypeScript**: compiled by `ts-loader` inside webpack; each package has its own `tsconfig.json` extending the root
- **Output**: `.dist/` directory in each package; UMD bundles named after the package (e.g. `esp-js.js` and `esp-js.min.js`)
- **Peer dependencies**: automatically externalized via custom `webpack/peerDepsExternalsPlugin`
- **Linting**: `tslint-loader` runs during webpack build (`tslint.json` at root)
- **Dev build**: `NODE_ENV=dev webpack` — no minification, includes source maps
- **Prod build**: `NODE_ENV=prod webpack` — minifies `*.min.js` bundles; copies `README.md` into `.dist/`

### Per-package build

```bash
npm run build-dev   # from inside a package directory
npm run build-prod
npm run dev         # webpack --watch
```

## Test Commands

- **Framework**: Jest 29 (`jsdom` environment)
- **Shared config**: `__jest__/jest.config.js` — each package's `jest.config.js` re-exports it
- **Test file pattern**: `**/tests/**/*Tests.[jt]s?(x)`
- **TypeScript preprocessor**: `__jest__/typeScriptPreprocessor.ts`

```bash
# From repo root:
npm test                     # run all packages, sorted by dependency order

# From inside a package:
npm test                     # jest --watchAll  (note: use "npm test -- --watchAll" to pass flags)
npm run test-ci              # jest (no watch, CI mode)
```

## Development Workflow

1. `npm install` — link packages after clone or after adding new inter-package dependencies
2. `npm run build-dev` — full build (required before tests can find compiled output in sibling packages)
3. Make changes to source in `packages/<pkg>/src/`
4. `npm run dev` from inside a package for watch-mode webpack rebuild
5. `npm test` from inside a package for watch-mode tests
6. `npm run build-prod && npm test` from root before committing

**Adding a new package**: use `npm run create-package` (invokes `nps create-package`).

**Local linking**: npm workspaces handle symlinking automatically — no `npm link` required.

## Key Architectural Patterns

### The Router event dispatch cycle

1. `router.publishEvent(modelId, eventType, event)` — enqueues event
2. Router drains the queue, dispatching each event through four sequential observation stages:
   - `preview` — observe before mutation; can cancel the event (`PreviewHandler`)
   - `normal` — primary mutation stage; immer `produce` is applied, handler receives a `Draft<TModel>` (`EventHandler`)
   - `committed` — only fires if `eventContext.commit()` was called during `normal`
   - `final` — fires regardless of commit; effects run here, receiving the frozen immutable model (`EffectHandler`)
3. After all events for a model are processed, the model is pushed to model observers (`router.getModelObservable(modelId)`)

### Functional model pattern (v9+)

The primary way to register a model with the router. Use `ModelBuilder<TModel>` to collect handlers, then call `registerWithRouter()` — the builder is discarded after registration:

```typescript
import {Router, ModelBuilder} from 'esp-js';

interface CounterModel { count: number; }

new ModelBuilder<CounterModel>(router, 'counter', { count: 0 })
    .withPreviewHandler('Increment', (model, event, ctx) => {
        if (event.amount < 0) ctx.cancel();
    })
    .withEventHandler('Increment', (draft, event) => {
        draft.count += event.amount; // mutate immer draft directly
    })
    .withEffect('Increment', (model, event, ctx, publish) => {
        if (model.count > 100) publish('CounterMaxed', {});
    })
    .withEventSubscription(publish => {
        const timer = setInterval(() => publish('Tick', {}), 1000);
        return { dispose: () => clearInterval(timer) };
    })
    .registerWithRouter();
```

Handler types:
- `EventHandler<TModel, TEvent>` — receives `Draft<TModel>` (immer); mutations applied via `produce()`
- `PreviewHandler<TModel, TEvent>` — receives `Readonly<TModel>`; call `eventContext.cancel()` to suppress
- `EffectHandler<TModel, TEvent>` — receives `Readonly<TModel>` + `PublishDelegate`; runs at `final` stage; use for side-effects and publishing secondary events
- `SubscriptionFactory` — `(publish: PublishDelegate) => Disposable`; set up long-lived subscriptions (timers, streams)

### React integration (esp-js-react)

- `<EspRouterContextProvider router={router}>` — provides router via context
- `ConnectableComponent` / `connect()` — subscribes to a model by `modelId`, re-renders on model updates
- `useSyncModelWithSelector` — hook-based subscription with selector and equality function
- `@viewBinding(MyView)` decorator on model class — declaratively binds a React component to the model

### Composite app (esp-js-ui)

- `Shell` — bootstraps the container, router, RegionManager, ViewRegistryModel; loads modules
- `ModuleBase` — abstract base for feature modules; decorated with `@espModule(key, name)`; each module gets a child DI container
- `ViewFactoryBase` — abstract base for view factories; decorated with `@viewFactory(viewKey, shortName)`; creates model+view pairs
- `RegionManager` — manages named regions; views are added/removed dynamically via `regionManager.addRegionItem(regionName, item)`

## Coding Conventions

- **TypeScript strictness**: `noImplicitAny: false`, `strictNullChecks: false` — the codebase does not use strict mode
- **Decorators**: `experimentalDecorators: true`, `emitDecoratorMetadata: true` — legacy decorator style (stage 2); used in `esp-js-react` (`@viewBinding`) and `esp-js-ui` (`@espModule`, `@viewFactory`); no longer used for model event handlers in `esp-js` core
- **Exports**: each package re-exports everything through `src/index.ts`; sub-directory `index.ts` files are auto-generated
- **Disposables**: lifecycle management uses `DisposableBase` / `CompositeDisposable`; `addDisposable()` registers cleanup
- **Logging**: `Logger.create('ComponentName')` — structured logging with configurable sinks; use `_log.verbose/debug/info/warn/error`
- **Guards**: `Guard.isString()`, `Guard.isDefined()` etc. used throughout for runtime argument validation
- **Event type constants**: event types are plain strings — define them as string constants in a dedicated file
- **Functional model handlers**: define handlers as plain typed functions (`EventHandler`, `PreviewHandler`, `EffectHandler`) and register via `ModelBuilder` — do not use class inheritance or decorators for model event handling in new code

## Breaking Changes (v9)

| Removed | Replacement |
|---------|-------------|
| `ModelBase` class | `ModelBuilder<TModel>` — functional registration |
| `@observeEvent` / `@observeEventEnvelope` decorators | `builder.withEventHandler()`, `.withPreviewHandler()`, `.withEffect()` |
| `router.observeEventsOn(modelId, model)` | Handled internally by `ModelBuilder.registerWithRouter()` |
| `router.runAction(modelId, action)` | Use `EffectHandler` with `PublishDelegate`, or dispatch from `committed`/`final` stage |
| `router.addModel(modelId, model, eventProcessors?)` | `router.addModel(modelId, initialModel, config: ModelConfig<TModel>)` |
| `EventProcessors` interface | `preEventProcessor` / `postEventProcessor` fields on `ModelConfig<TModel>` |
| `esp-js-polimer` package | `ModelBuilder` + immer built into `esp-js` core |

Migration guide: see `CHANGES-v9.md` at the repo root.

## Important Files

| Path | Purpose |
|------|---------|
| `webpack.config.base.js` | Shared webpack config inherited by all packages |
| `package-scripts.js` | `nps` script definitions shared by all packages |
| `__jest__/jest.config.js` | Shared Jest configuration |
| `__jest__/typeScriptPreprocessor.ts` | Jest TypeScript transform |
| `tslint.json` | Lint rules applied during webpack build |
| `CHANGES-v9.md` | Full v9 breaking changes and migration guide |
| `packages/esp-js-ui/src/ui/dependencyInjection/systemContainerConst.ts` | Well-known DI container key constants |
| `packages/esp-js-ui/src/ui/dependencyInjection/systemContainerConfiguration.ts` | Registers all framework services into the root container |
| `webpack/peerDepsExternalsPlugin.js` | Auto-externalizes peer dependencies in webpack bundles |
