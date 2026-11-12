import { ModuleBuilder, ModuleContext } from 'esp-js-ui';
import { registerTodoStore } from './stores/todoStore';
import { TodoView } from './views/todoView';

export const todoModule = ModuleBuilder
    .create('todo')
    .withView('todo-store-id', TodoView, 'main')
    .withInitialisation(async ({ eventBus }: ModuleContext) => {
        registerTodoStore(eventBus, 'todo-store-id');
    })
    .build();
