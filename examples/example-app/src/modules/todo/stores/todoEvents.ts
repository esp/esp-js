export const TodoEvents = {
    UpdateNewItemText: 'Todo/UpdateNewItemText',
    AddTodo:          'Todo/AddTodo',
    ToggleTodo:       'Todo/ToggleTodo',
    DeleteTodo:       'Todo/DeleteTodo',
    SetFilter:        'Todo/SetFilter',
    ClearCompleted:   'Todo/ClearCompleted',
} as const;

export type TodoEventType = typeof TodoEvents[keyof typeof TodoEvents];
