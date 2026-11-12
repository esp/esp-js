import {immerable} from 'immer';

export interface TodoItem {
    id: string;
    text: string;
    completed: boolean;
}

export type FilterMode = 'all' | 'active' | 'completed';

export class TodoModel {
    [immerable] = true;

    items: TodoItem[] = [];
    newItemText: string = '';
    filter: FilterMode = 'all';

    addTodo(): void {
        const text = this.newItemText.trim();
        if (!text) {
            return;
        }
        this.items.push({
            id: `${Date.now()}-${Math.random().toString(36).slice(2)}`,
            text,
            completed: false,
        });
        this.newItemText = '';
    }

    toggleTodo(id: string): void {
        const item = this.items.find(i => i.id === id);
        if (item) {
            item.completed = !item.completed;
        }
    }
}