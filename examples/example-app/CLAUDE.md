# example-app

## Purpose

A TodoMVC-style example application demonstrating the v9 ESP stack end-to-end:
- `AppBuilder` / `ModuleBuilder` from `esp-js-ui` for bootstrapping
- `StoreBuilder` with a class-based model (using `[immerable]`) from `esp-js`
- `EspApp` + `RegionView` + `usePublishStoreEvent` from `esp-js-react`

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
```

## Bootstrap Flow

```
main.tsx
  AppBuilder.create('todo-app').withModule(todoModule).build()
  → app.start()
      → todoModule.withInitialisation: registerTodoStore(app.eventBus, 'todo-store-id')
  → ReactDOM.render(
        <EspApp app={app}>         ← provides EventBus + modules contexts
            <AppShell />
        </EspApp>
    )

AppShell
  → <RegionView regionName="main" />
      → ConnectableComponent storeId="todo-store-id" view={TodoView}
          → TodoView({ model })
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

## Event Types

All event types are in `todoEvents.ts` as a `const` object:

```typescript
export const TodoEvents = {
    UpdateNewItemText: 'Todo/UpdateNewItemText',
    AddTodo:          'Todo/AddTodo',
    ToggleTodo:       'Todo/ToggleTodo',
    DeleteTodo:       'Todo/DeleteTodo',
    SetFilter:        'Todo/SetFilter',
    ClearCompleted:   'Todo/ClearCompleted',
} as const;
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
