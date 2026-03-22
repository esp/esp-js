# esp-js-polimer

## Package Purpose

Adds immutable, Redux-style model support to ESP. A `PolimerModel` is an immutable top-level model (implementing `ImmutableModel`) registered with the `Router`. State mutations are applied via [immer](https://immerjs.github.io/immer/) drafts, making each event handler a pure "produce" function. Also provides `eventTransformFor` for async side-effects that produce new events via RxJS observables, and `StateHandlerModel` for interop with OO-style sub-models.

## Role in Monorepo

- **Depends on**: `esp-js`, `immer`, `rxjs`
- Depended on by: `esp-js-react`, `esp-js-ui`
- Published as `esp-js-polimer` on npm

## Build and Test

```bash
npm run build-dev
npm run build-prod
npm test            # jest --watchAll
npm run test-ci     # jest (CI)
```

Output: `.dist/esp-js-polimer.js`, `.dist/typings/index.d.ts`.

## Source Structure

```
src/
  index.ts                  # Re-exports; also imports modelBuilderUpdater and configImmer for side effects
  polimerModel.ts           # PolimerModel<TModel> class — the registered model object
  modelBuilderUpdater.ts    # PolimerModelBuilder + PolimerModelUpdater fluent builders
  immutableModel.ts         # ImmutableModel interface (marker type)
  immutableModelUtility.ts  # ImmutableModelUtility — manages immer proxy and model snapshots
  stateHandlerModel.ts      # StateHandlerModel<TState> interface — OO sub-model interop
  stateEventHandlers.ts     # PolimerEventHandler type + StateHandlerConfiguration
  stateReaderWriter.ts      # StateReaderWriter, MapReaderWriter, DirectStateReaderWriter
  eventTransformations.ts   # @eventTransformFor decorator + InputEvent/OutputEvent types
  eventEnvelopePredicate.ts # EventEnvelopePredicate — conditional event delivery
  eventProcessors.ts        # ModelPreEventProcessor, ModelPostEventProcessor
  polimerEvents.ts          # Built-in ESP polimer event type constants
  strictMode.ts             # StrictMode settings for immer strict mode
  configImmer.ts            # Configures immer on import (side effect)
  logger.ts                 # Package-local logger
```

## Key Concepts and Patterns

### ImmutableModel

A plain TypeScript interface representing the model's state shape. It is a "bag of state slices":

```typescript
interface MyModel extends ImmutableModel {
    orders: OrdersState;
    ui: UiState;
}
```

### PolimerModelBuilder

The fluent builder used to construct and register a `PolimerModel` with the `Router`:

```typescript
import {PolimerModelBuilder} from 'esp-js-polimer';

const model = new PolimerModelBuilder<MyModel>(router, initialModel, modelId)
    .withStateHandlers('orders', ordersHandlers)   // object with @observeEvent methods
    .withStateHandlers('ui', uiHandlers)
    .withStateHandlerModel('orders', myOOSubModel) // OO interop
    .withEventTransforms(myTransformsObject)       // async event transforms
    .withPreEventProcessor(preProcessor)
    .withPostEventProcessor(postProcessor)
    .registerWithRouter();                         // builds + registers PolimerModel with router
```

### State Handlers

Handler objects use `@observeEvent` decorators. The handler receives an **immer draft** of its state slice — mutations are applied by immer's `produce`:

```typescript
class OrdersHandlers {
    @observeEvent('OrderAdded')
    onOrderAdded(draft: OrdersState, event: OrderAddedEvent, eventContext: EventContext) {
        draft.items.push(event.order); // mutate draft directly
    }

    @observeEvent('OrderCleared')
    onOrderCleared(draft: OrdersState) {
        draft.items = [];
    }
}
```

The state key (`'orders'`) maps handler objects to slices of the top-level `ImmutableModel`.

### Event Transforms

For async operations (HTTP, WebSocket, timers) use `@eventTransformFor` on methods that return RxJS `Observable<OutputEvent<TEvent>[]>`:

```typescript
class OrderTransforms {
    @eventTransformFor('FetchOrders')
    fetchOrders(inputStream: InputEventStream<MyModel, FetchOrdersEvent>): OutputEventStream<OrdersLoaded> {
        return inputStream.pipe(
            switchMap(({event, model}) =>
                this._api.getOrders(event.filter).pipe(
                    map(orders => [{ eventType: 'OrdersLoaded', event: { orders } }])
                )
            )
        );
    }
}
```

`InputEvent<TModel, TEvent>` provides `eventType`, `event`, `model` (a proxy to the latest immutable model), and `context`.

### PolimerModel

`PolimerModel<TModel>` is the object registered with the `Router`. It:
- Wraps the immutable model in an immer proxy
- Dispatches events to the appropriate state handler via `produce()`
- Exposes `getImmutableModel()` and `getEspPolimerImmutableModelProxy()`
- Extends `DisposableBase` — disposing it removes it from the router

### StateHandlerModel

Allows an OO-style sub-model (implementing `StateHandlerModel<TState>`) to coexist with the immutable model:

```typescript
interface StateHandlerModel<TState> {
    getEspPolimerState(): TState; // provides its state slice
    preProcess?(model: any): void;
    postProcess?(model: any, events: string[]): void;
}
```

### PolimerModelUpdater

After initial construction, use `PolimerModelUpdater` to dynamically wire/unwire state handlers and event transforms at runtime.

### StrictMode

Import from `esp-js-polimer` and configure immer strict mode settings if needed. Strict mode makes immer throw on accidental mutations outside `produce`.

## Public API

- `PolimerModel<TModel>` — the registered router model
- `PolimerModelBuilder<TModel>`, `PolimerModelUpdater` — fluent construction/update
- `ImmutableModel` — marker interface for model types
- `StateHandlerModel<TState>` — OO sub-model interop interface
- `PolimerEventHandler` — type alias for handler functions
- `eventTransformFor(eventType, stage?)` — decorator for async event transforms
- `InputEvent<TModel, TEvent>`, `InputEventStream`, `OutputEvent<TEvent>`, `OutputEventStream` — transform types
- `EventEnvelopePredicate<TModel, TEvent>` — conditional delivery predicate
- `PolimerEvents` — built-in event type string constants
- `StrictMode`, `StrictModeSettings`

## Testing Approach

- Test files: `tests/**/*Tests.ts`
- Tests build a real `Router` + `PolimerModel` via `PolimerModelBuilder`
- `tests/testApi/` — shared test helpers and fixture models
- Notable test files:
  - `eventObservationTests.ts` — state handler dispatch
  - `eventTransformTests.ts` — async event transform pipeline
  - `ooModelnteropTests.ts` — `StateHandlerModel` interop
  - `immutableModelUtilityTests.ts` — proxy and snapshot behaviour
  - `modelBuilderUpdaterTests.ts` — dynamic wiring

## Common Tasks

**Build a model and register with router:**
```typescript
const router = new Router();
const initialModel: MyModel = { orders: { items: [] }, ui: { isLoading: false } };
new PolimerModelBuilder<MyModel>(router, initialModel, 'my-model')
    .withStateHandlers('orders', new OrdersHandlers())
    .withStateHandlers('ui', new UiHandlers())
    .withEventTransforms(new OrderTransforms())
    .registerWithRouter();
```

**Subscribe to model updates (immutable model):**
```typescript
router.getModelObservable<PolimerModel<MyModel>>('my-model').subscribe(polimerModel => {
    const immutable = polimerModel.getImmutableModel();
    render(immutable);
});
```

**Access model in a React hook (via esp-js-react):**
```typescript
const state = useSyncModelWithSelector<OrdersState>(
    m => m.orders,
    syncModelWithSelectorOptions<OrdersState>().setModelId('my-model').build()
);
```

## Gotchas

- State handler methods receive an **immer draft** — returning a new object (instead of mutating the draft) only works if you return the new value explicitly from the handler; otherwise immer ignores it
- `configImmer.ts` is imported as a side effect on package load — it configures immer globally; do not import `configImmer.ts` separately
- `modelBuilderUpdater.ts` is also imported for side effects — it patches `Router` with polimer builder extension methods
- The `model` property on `InputEvent` is a **Proxy** to the latest model state, not a snapshot — close over a snapshot if you need a stable reference during async operations
- `@eventTransformFor` defaults to `ObservationStage.final` — handlers run after all normal-stage mutations are complete
- OO `StateHandlerModel` methods decorated with `@observeEvent` receive the **mutable OO model** (not an immer draft) — immer is not involved for those methods
