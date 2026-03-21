# esp-js-ui

## Package Purpose

The composite application framework for ESP. Provides the `Shell` bootstrapper, `ModuleBase` for feature modules, `RegionManager` and region models for dynamic view placement, `ViewFactoryBase` for view+model lifecycle, a `StateService` for persisting UI state, health monitoring, and supporting utilities. This is the highest-level package in the monorepo — it ties together all other esp-* packages into a structured application architecture.

## Role in Monorepo

- **Depends on**: `esp-js`, `esp-js-di`, `esp-js-metrics`, `esp-js-react`, `esp-js-rx`, `classnames`, `query-string`, `react`, `rxjs`, `uuid`
- No other esp-* packages depend on this one — it is a leaf in the dependency graph
- Published as `esp-js-ui` on npm

## Build and Test

```bash
yarn build-dev
yarn build-prod
yarn test
yarn test-ci
```

Output: `.dist/esp-js-ui.js`, `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  index.ts            # Re-exports core, health, ui, logger
  logger.ts           # Package-local logger
  core/               # Standalone utilities (no ESP-specific dependencies)
    decimal.ts / decimalFormat.ts  # Decimal number formatting utilities
    environment.ts    # Runtime environment detection
    observableExt.ts  # RxJS observable extension helpers
    schedulerService.ts  # SchedulerService (wraps RxJS schedulers, injectable)
    unit.ts / utils.ts
  health/
    espAggregateHealthIndicator.ts  # Health indicator that monitors DI container registrations
  ui/
    modelBase.ts      # Re-exports ModelBase from esp-js for backwards compatibility
    viewBase.tsx      # Abstract React base component (for OO view patterns)
    espUiEventNames.ts / espUiEvents.ts  # Well-known ESP UI event type string constants
    idFactory.ts      # UUID-based ID generation
    dependencyInjection/
      systemContainerConst.ts        # String constants for well-known DI registrations
      systemContainerConfiguration.ts  # Registers all framework services (Router, RegionManager, etc.)
      literalResolver.ts             # DI resolver that passes literals through unchanged
    modules/
      shell.ts          # Shell — abstract base; bootstraps app, loads modules, manages regions
      moduleBase.ts     # ModuleBase — abstract base for feature modules
      module.ts         # Module interface
      moduleDecorator.ts  # @espModule(key, name) decorator + EspModuleDecoratorUtils
      moduleProvider.ts   # ModuleProvider interface
      moduleLoadResult.ts # ModuleLoadResult, AggregateModuleLoadResult, ModuleLoadStage
      singleModuleLoader.ts  # DefaultSingleModuleLoader — loads a single module asynchronously
      appState.ts       # AppDefaultStateProvider interface + NoopAppDefaultStateProvider
      prerequisites/    # PrerequisiteRegister — declare async prerequisites before module loads
    regions/
      models/
        regionManager.ts   # RegionManager — singleton; owns all named regions
        regionBase.ts      # RegionBase<TRegionState> — abstract base for region models
        region.ts          # Region — standard (non-stateful) region implementation
        statefulRegion.ts  # StatefulRegion — region with persisted state
        regionItem.ts      # RegionItem — represents a request to add a view to a region
        regionItemRecord.ts  # RegionItemRecord — tracks a live view within a region
        regionModelBase.ts   # RegionModelBase — abstract base for region models registered with router
        regionState.ts     # RegionState — serialisable region state shape
        events.ts          # Region-related event type constants
      views/
        singleItemRegionView.tsx      # Region view: shows one item at a time
        multiItemRegionView.tsx       # Region view: shows all items simultaneously
        selectableMultiItemView.tsx   # Region view: tabbed/selectable multi-item
        regionItemRecordView.tsx      # Renders a single RegionItemRecord (resolves view via @viewBinding)
    state/
      stateService.ts    # StateService interface + LocalStorageStateService implementation
      stateSaveMonitor.ts  # Monitors model observables and saves state on changes
    viewFactory/
      viewFactoryBase.ts         # ViewFactoryBase<TModel, TViewState> — abstract base
      viewFactoryDecorator.ts    # @viewFactory(viewKey, shortName) decorator
      viewRegistryModel.ts       # ViewRegistryModel — tracks all registered ViewFactory instances
      state.ts / stateProvider.ts  # View state serialisation helpers
      viewFactoryDefaultStateProvider.ts  # Interface for default state provision
```

## Key Concepts and Patterns

### Application Bootstrap with Shell

`Shell` is the entry point for composite apps. Subclass it and override `configureShell()`:

```typescript
class MyShell extends Shell {
    protected configureShell(container: Container): void {
        // configure app-wide services in container
        container.register('myApiClient', ApiClient).singleton();
    }

    protected getModuleConstructors(): ModuleConstructor[] {
        return [OrdersModule, TradeModule];
    }

    public get stateSavingEnabled(): boolean {
        return true; // enables LocalStorage state persistence
    }
}

const shell = new MyShell();
shell.start(); // bootstraps container, creates Router, RegionManager; loads modules
```

`Shell` registers well-known services via `SystemContainerConfiguration.configureContainer()`:
- `SystemContainerConst.router` → `Router` singleton
- `SystemContainerConst.region_manager` → `RegionManager` singleton
- `SystemContainerConst.views_registry_model` → `ViewRegistryModel` singleton
- `SystemContainerConst.state_service` → `LocalStorageStateService` singleton
- `SystemContainerConst.scheduler_service` → `SchedulerService` singleton

### Modules with ModuleBase

Each feature module subclasses `ModuleBase` and is decorated with `@espModule`:

```typescript
@espModule('orders-module', 'Orders Module')
class OrdersModule extends ModuleBase {
    constructor(container: Container) { super(container); }

    public configureContainer(): void {
        this.container.register('ordersService', OrdersService).singleton();
    }

    public registerPrerequisites(register: PrerequisiteRegister): void {
        // register async prerequisites (e.g. initial data loads)
    }

    protected get isOnNewStateApi(): boolean { return true; }

    public registerViewFactories(viewRegistryModel: ViewRegistryModel): void {
        viewRegistryModel.registerViewFactory(this.container, OrdersViewFactory);
    }
}
```

Each module receives a **child DI container** — module-local services are isolated from other modules. Disposing the module disposes its container.

### RegionManager and Regions

Regions are named areas of the UI that accept views dynamically:

```typescript
// In a module or shell setup:
this.regionManager.registerRegion('main-region', new Region('main-region', router));

// Adding a view to a region:
this.regionManager.addToRegion('main-region', new RegionItem(modelId, displayContext));

// In JSX (render the region):
<SingleItemRegionView regionName="main-region" />
```

Built-in region views:
- `SingleItemRegionView` — shows one active item (replaces on change)
- `MultiItemRegionView` — shows all items simultaneously
- `SelectableMultiItemView` — tabbed; one item selected at a time

`RegionItemRecordView` resolves the view component for each item via `@viewBinding` metadata on the model.

### ViewFactoryBase

View factories create and own model+view pairs. Decorated with `@viewFactory(viewKey, shortName)`:

```typescript
@viewFactory('orders-view', 'Orders')
class OrdersViewFactory extends ViewFactoryBase<OrdersModel> {
    constructor(container: Container) { super(container); }

    createView(creationState?: ViewCreationState<OrdersViewState>): OrdersModel {
        const model = new OrdersModel(
            this.container.resolve('router'),
            creationState?.viewState
        );
        return model;
    }
}
```

`ViewRegistryModel` tracks all registered factories and creates views on demand from `RegionManager`.

### SystemContainerConst Keys

Use these constants (not magic strings) to resolve framework services:

```typescript
container.resolve<Router>(SystemContainerConst.router)
container.resolve<RegionManager>(SystemContainerConst.region_manager)
container.resolve<ViewRegistryModel>(SystemContainerConst.views_registry_model)
container.resolve<StateService>(SystemContainerConst.state_service)
```

### State Persistence

`LocalStorageStateService` saves/restores view state to `localStorage` automatically when `Shell.stateSavingEnabled` is `true`. State is keyed by `viewKey` (from `@viewFactory`). `StateSaveMonitor` subscribes to model observables and triggers saves on update.

## Public API

Everything exported from `src/index.ts` — the three top-level namespaces:
- `src/core/` — `SchedulerService`, `ObservableExt`, `Decimal`, environment utils
- `src/health/` — `EspAggregateHealthIndicator`
- `src/ui/` — `Shell`, `ModuleBase`, `Module`, `espModule`, `RegionManager`, `Region`, `StatefulRegion`, `RegionBase`, `RegionItem`, `RegionItemRecord`, `RegionManager`, `ViewFactoryBase`, `ViewRegistryModel`, `viewFactory`, `ModelBase` (re-export), `SystemContainerConst`, `SystemContainerConfiguration`, `StateService`, `EspUiEventNames`, `EspUiEvents`, region view components

## Testing Approach

- Test files: `tests/ui/**/*Tests.ts?(x)`
- Directory mirrors `src/ui/`:
  - `tests/ui/modules/` — module loading, prerequisites
  - `tests/ui/regions/` — region model, region item, region manager
  - `tests/ui/viewFactory/` — view factory state and creation
  - `tests/core/` — decimal/core utilities
- Tests instantiate real `Router` and `Container` instances

## Common Tasks

**Register a custom region at shell startup:**
```typescript
const regionManager = container.resolve<RegionManager>(SystemContainerConst.region_manager);
regionManager.registerRegion('sidebar', new Region('sidebar', router));
```

**Add a view to a region from within a module:**
```typescript
const item = new RegionItem(this.container.resolve('myModelId'), 'default');
this.regionManager.addToRegion('main-region', item);
this.addDisposable(() => this.regionManager.removeFromRegion('main-region', item));
```

**Look up a well-known service from a module:**
```typescript
const router = this.container.resolve<Router>(SystemContainerConst.router);
```

**Persist view state:**
```typescript
// In ViewFactoryBase subclass:
public getDefaultViewState(): OrdersViewState[] {
    return [{ filter: 'all' }]; // default state if none saved
}
```

## Gotchas

- `ModuleBase.regionManager` is a protected convenience getter — it resolves `SystemContainerConst.region_manager` from the module's child container, which inherits from the root container where `RegionManager` is registered as a singleton
- `isOnNewStateApi` is an abstract getter on `ModuleBase` — it must return `true` for new modules; legacy modules that predate this API are treated as legacy and their view factories are wired differently
- `ModelBase` in `esp-js-ui/src/ui/modelBase.ts` is a **re-export** from `esp-js` for backwards compatibility — it is the same class; import from either location
- `Shell.start()` is async — module prerequisites may involve network requests; the returned observable emits `AggregateModuleLoadResult` events through each `ModuleLoadStage`
- Region views (`SingleItemRegionView`, etc.) expect to be rendered inside `EspRouterContextProvider` — the router must be available via React context
- `@viewFactory` metadata is stored on the constructor, not the instance — `ViewRegistryModel` reads it via the class constructor, not from `new` instances
