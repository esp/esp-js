# ESP (Evented State Processor) — Monorepo

## Project Overview

ESP is a TypeScript/JavaScript framework for managing model state changes in a deterministic, event-driven manner. A central `Router` sits between event publishers and models: publishers call `router.publishEvent(modelId, eventType, event)`, the router queues and dispatches events through ordered observation stages, and the mutated model is then pushed to model observers. The framework supports both OO and immutable (Redux-like) modeling patterns and is designed for complex composite single-page applications.

The monorepo contains the core router, dependency injection container, React integration, immutable model support, RxJS utilities, a composite-app UI framework, and supporting packages.

## Monorepo Structure

```
packages/
  esp-js              # Core event router — foundational, no dependencies on other esp-* packages
  esp-js-di           # Standalone IoC container (JavaScript, not TypeScript)
  esp-js-metrics      # Pluggable metrics abstraction (prom-client-compatible interface)
  esp-js-polimer      # Immutable model support using immer; depends on esp-js + rxjs
  esp-js-react        # React bindings (ConnectableComponent, hooks); depends on esp-js + esp-js-polimer
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
  └── esp-js-polimer
        └── esp-js-react
              └── esp-js-ui  (also depends on esp-js-di, esp-js-metrics, esp-js-rx)
  └── esp-js-ui-rxcompat  (also depends on esp-js-rx)
```

## Monorepo Tooling

- **Package manager**: npm (workspaces)
- **Monorepo orchestration**: Lerna 8 (`lerna.json`)
- **Per-package build scripts**: delegated to `nps` (`package-scripts.js` at root defines shared scripts)
- **Versioning**: Lerna fixed-mode — all packages share the same version (`8.1.0`)
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

**Adding a new package**: use `yarn create-package` (invokes `nps create-package`).

**Local linking**: Yarn workspaces handle symlinking automatically — no `yarn link` required.

## Key Architectural Patterns

### The Router event dispatch cycle

1. `router.publishEvent(modelId, eventType, event)` — enqueues event
2. Router drains the queue, dispatching each event through four sequential observation stages:
   - `preview` — observe before mutation; can cancel the event
   - `normal` — primary mutation stage
   - `committed` — only fires if `eventContext.commit()` was called during `normal`
   - `final` — fires regardless of commit; observe after all mutation
3. After all events for a model are processed, the model is pushed to model observers (`router.getModelObservable(modelId)`)

### OO model pattern (esp-js core)

- Extend `ModelBase` (from `esp-js`, re-exported by `esp-js-ui`)
- Decorate handler methods with `@observeEvent(eventType)` or `@observeEvent(eventType, ObservationStage.preview)`
- Call `this.observeEvents()` in the constructor to register the model and wire decorators

### Immutable model pattern (esp-js-polimer)

- Define a plain `ImmutableModel` interface (nested state slices)
- Use `PolimerModelBuilder` to construct a `PolimerModel` registered with the router
- Decorate handler methods with `@observeEvent` on state handler objects; immer's `produce` applies mutations as drafts
- Use `@eventTransformFor` on observable-returning methods for async side-effects that produce new events

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
- **Decorators**: `experimentalDecorators: true`, `emitDecoratorMetadata: true` — legacy decorator style (stage 2)
- **Exports**: each package re-exports everything through `src/index.ts`; sub-directory `index.ts` files are auto-generated
- **Disposables**: lifecycle management uses `DisposableBase` / `CompositeDisposable`; `addDisposable()` registers cleanup
- **Logging**: `Logger.create('ComponentName')` — structured logging with configurable sinks; use `_log.verbose/debug/info/warn/error`
- **Guards**: `Guard.isString()`, `Guard.isDefined()` etc. used throughout for runtime argument validation
- **Event type constants**: event types are plain strings — define them as string constants in a dedicated file

## Important Files

| Path | Purpose |
|------|---------|
| `webpack.config.base.js` | Shared webpack config inherited by all packages |
| `package-scripts.js` | `nps` script definitions shared by all packages |
| `__jest__/jest.config.js` | Shared Jest configuration |
| `__jest__/typeScriptPreprocessor.ts` | Jest TypeScript transform |
| `tslint.json` | Lint rules applied during webpack build |
| `packages/esp-js-ui/src/ui/dependencyInjection/systemContainerConst.ts` | Well-known DI container key constants |
| `packages/esp-js-ui/src/ui/dependencyInjection/systemContainerConfiguration.ts` | Registers all framework services into the root container |
| `webpack/peerDepsExternalsPlugin.js` | Auto-externalizes peer dependencies in webpack bundles |
