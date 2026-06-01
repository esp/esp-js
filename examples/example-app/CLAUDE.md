# example-app

## Purpose

A TodoMVC-style example application demonstrating the v9 ESP stack end-to-end:
- `AppBuilder` / `ModuleBuilder` from `esp-js-ui` for bootstrapping
- `StoreBuilder` with a class-based model (using `[immerable]`) from `esp-js`
- `EspApp` + `RegionView` + `usePublishStoreEvent` from `esp-js-react`

The app loads **two modules**:
- `todo` — the core TodoMVC store/view (region `main`)
- `weather` — demonstrates the `esp-js-di` container (`WeatherService` singleton), async `withInitialisation`, and the `withPreviewHandler` / `withEffect` / `withEventSubscription` handler types against a live API (open-meteo) (region `weather`)

This is a **private** app — not published to npm. Used for manual testing and as a reference implementation.

## Running

```bash
npm run dev        # vite dev server (hot reload)
npm run build-dev  # vite build only (no tsc)
npm run build-prod # tsc + vite build
npm run preview    # serve .dist/ locally
```

Output: `.dist/` (not published).

## Source Structure

```
src/
  main.tsx                              # Bootstrap: AppBuilder → app.start() → ReactDOM.render(<EspApp>)
  shell/
    appShell.tsx                        # Root shell: renders <RegionView regionName="main" />
  modules/
    todo/
      todoModule.ts                     # ModuleBuilder: registers TodoView in 'main', calls registerTodoStore
      stores/
        todoEvents.ts                   # TodoEvents — event type string constants
        todoModel.ts                    # TodoModel class ([immerable]) + TodoItem interface + FilterMode type
        todoStore.ts                    # registerTodoStore(bus, storeId) — StoreBuilder registration
      views/
        todoView.tsx                    # TodoView component — receives model prop, uses usePublishStoreEvent
        todoItem.tsx                    # TodoItem component — checkbox, text, delete button
    weather/
      weatherModule.ts                  # ModuleBuilder: registers WeatherService, binds WeatherView to 'weather' region
      services/
        weatherService.ts              # WeatherService — geolocation + open-meteo fetch
      stores/
        weatherEvents.ts               # WeatherEvents constants + WeatherEventType
        weatherModel.ts                # WeatherModel ([immerable]) + WeatherData + weatherCodeToDescription
        weatherStore.ts                # registerWeatherStore(app, storeId) — StoreBuilder w/ preview, effect, subscription
      views/
        weatherView.tsx                # WeatherView — loading/error/data states, refresh button
```

## Bootstrap Flow

```
main.tsx
  AppBuilder.create('todo-app')
    .withModule(weatherModule)
    .withModule(todoModule)
    .build()
  → app.start()
      → weatherModule.withInitialisation: registerWeatherStore(app, 'weather-store-id'),
                                          resolve location, publish SetLocation + FetchWeather
      → todoModule.withInitialisation:    registerTodoStore(app.eventBus, 'todo-store-id')
  → ReactDOM.render(
        <EspApp app={app}>         ← provides EventBus + modules contexts
            <AppShell />
        </EspApp>
    )

AppShell
  → <RegionView regionName="main" />        → ConnectableComponent storeId="todo-store-id"    view={TodoView}
  → <RegionView regionName="weather" />     → ConnectableComponent storeId="weather-store-id" view={WeatherView}
```

## Store Implementation

`todoModel.ts` defines `TodoModel` as a class with `[immerable] = true` (required for immer to handle class instances):

```typescript
import { immerable } from 'immer';

export class TodoModel {
    [immerable] = true;
    items: TodoItem[] = [];
    newItemText: string = '';
    filter: FilterMode = 'all';

    addTodo(): void { /* mutates this.items, clears newItemText */ }
    toggleTodo(id: string): void { /* flips item.completed */ }
}
```

`todoStore.ts` registers the store using `bus.storeBuilder<TodoModel>()`:

```typescript
bus.storeBuilder<TodoModel>(storeId, new TodoModel())
    .withEventHandler(TodoEvents.AddTodo, (draft) => { draft.addTodo(); })
    .withEventHandler(TodoEvents.ToggleTodo, (draft, e: { id: string }) => { draft.toggleTodo(e.id); })
    .withEventHandler(TodoEvents.DeleteTodo, (draft, e: { id: string }) => {
        draft.items = draft.items.filter(i => i.id !== e.id);
    })
    // ... other handlers
    .build();
```

Event handlers either call methods on the immer draft or mutate it inline.

## View Implementation

`TodoView` receives `model: TodoModel` as a prop (injected by `ConnectableComponent`). It uses `usePublishStoreEvent()` to publish events without needing the `storeId`:

```typescript
const publishStoreEvent = usePublishStoreEvent();
// publish('Todo/AddTodo', {})
```

`FilterMode` and `TodoItem` are defined in `todoModel.ts`. `todoTypes.ts` exists but is empty — types live with the model.

## Weather Module (esp-js-di + async patterns)

The `weather` module is the counterpoint to `todo`: where todo shows the minimal store/view loop, weather exercises the parts of the stack todo does not.

- **esp-js-di** — `weatherModule.ts` registers `WeatherService` as a singleton via `withContainerConfiguration`, then resolves it (`app.container.resolve('weatherService')`) in both `withInitialisation` and `registerWeatherStore`.
- **Async `withInitialisation`** — resolves the user's location (geolocation → reverse-geocode, falling back to Perth, WA), then publishes `SetLocation` followed by `FetchWeather`.
- **`withPreviewHandler` (cancel)** — cancels `FetchWeather` if a fetch is already in flight (`if (model.isLoading) ctx.cancel()`).
- **`withEffect`** — performs the async `fetch` against open-meteo and publishes `FetchWeatherSuccess` / `FetchWeatherError` (you cannot `publishEvent` from a normal handler — side effects go here).
- **`withEventSubscription`** — a 60s `setInterval` auto-refresh; the returned `dispose()` clears the interval on store teardown.
- **Second region** — `WeatherView` is bound to region `'weather'`; `AppShell` renders `main` (todo) and `weather` side by side.

`weatherStore.ts` wires these together:

```typescript
app.eventBus.storeBuilder<WeatherModel>(storeId, new WeatherModel())
    .withEventHandler(WeatherEvents.SetLocation, (draft, e: { lat: number; lon: number; name: string }) => {
        draft.latitude = e.lat; draft.longitude = e.lon; draft.locationName = e.name;
    })
    .withPreviewHandler(WeatherEvents.FetchWeather, (model, _e, ctx) => { if (model.isLoading) ctx.cancel(); })
    .withEventHandler(WeatherEvents.FetchWeather, (draft) => { draft.isLoading = true; draft.error = null; })
    .withEffect(WeatherEvents.FetchWeather, (model, _e, _ctx, publish) => {
        service.fetchWeather(model.latitude, model.longitude)
            .then(data => publish(WeatherEvents.FetchWeatherSuccess, data))
            .catch(() => publish(WeatherEvents.FetchWeatherError, { message: '...' }));
    })
    .withEventHandler(WeatherEvents.FetchWeatherSuccess, (draft, e: WeatherData) => { draft.isLoading = false; draft.data = e; })
    .withEventHandler(WeatherEvents.FetchWeatherError, (draft, e: { message: string }) => { draft.isLoading = false; draft.error = e.message; })
    .withEventSubscription((publish) => {
        const id = setInterval(() => publish(WeatherEvents.FetchWeather, {}), 60_000);
        return { dispose: () => clearInterval(id) };
    })
    .build();
```

`WeatherModel` (`weatherModel.ts`) is a `[immerable]` class holding `isLoading`, `error`, `locationName`, lat/long, `data: WeatherData | null`, and `lastUpdated`. `weatherCodeToDescription(code)` (also in `weatherModel.ts`) maps open-meteo weather codes to text. `WeatherView` renders distinct loading / error / data states with a refresh button.

## Event Types

Each module keeps its event types in a `const` object — `todoEvents.ts` and `weatherEvents.ts`:

```typescript
export const TodoEvents = {
    UpdateNewItemText: 'Todo/UpdateNewItemText',
    AddTodo:          'Todo/AddTodo',
    ToggleTodo:       'Todo/ToggleTodo',
    DeleteTodo:       'Todo/DeleteTodo',
    SetFilter:        'Todo/SetFilter',
    ClearCompleted:   'Todo/ClearCompleted',
} as const;

export const WeatherEvents = {
    SetLocation:         'Weather/SetLocation',
    FetchWeather:        'Weather/FetchWeather',
    FetchWeatherSuccess: 'Weather/FetchWeatherSuccess',
    FetchWeatherError:   'Weather/FetchWeatherError',
} as const;
// weatherEvents.ts also exports: type WeatherEventType = typeof WeatherEvents[keyof typeof WeatherEvents];
```

## Dependencies

```json
{
  "esp-js": "*",
  "esp-js-di": "*",
  "esp-js-react": "*",
  "esp-js-ui": "*",
  "react": "^19.0.0",
  "react-dom": "^19.0.0"
}
```

All `esp-*` deps use `"*"` to pick up the local workspace versions. No tests — this is a manual dev/demo app.
