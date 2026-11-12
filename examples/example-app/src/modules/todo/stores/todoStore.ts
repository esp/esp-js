import { EventBus } from 'esp-js';
import { TodoEvents } from './todoEvents';
import {TodoModel, FilterMode} from './todoModel.ts';

export const registerTodoStore = (bus: EventBus, storeId: string): void => {
    bus.storeBuilder<TodoModel>(storeId, new TodoModel())
        .withEventHandler(TodoEvents.UpdateNewItemText, (draft, event: { text: string }) => {
            draft.newItemText = event.text;
        })
        .withEventHandler(TodoEvents.AddTodo, (draft) => {
            draft.addTodo();
        })
        .withEventHandler(TodoEvents.ToggleTodo, (draft, event: { id: string }) => {
            draft.toggleTodo(event.id);
        })
        .withEventHandler(TodoEvents.DeleteTodo, (draft, event: { id: string }) => {
            draft.items = draft.items.filter(i => i.id !== event.id);
        })
        .withEventHandler(TodoEvents.SetFilter, (draft, event: { filter: FilterMode }) => {
            draft.filter = event.filter;
        })
        .withEventHandler(TodoEvents.ClearCompleted, (draft) => {
            draft.items = draft.items.filter(i => !i.completed);
        })
        .build();
}
