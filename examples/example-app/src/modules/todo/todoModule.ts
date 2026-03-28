import { Container } from 'esp-js-di';
import {App, ModuleBuilder} from 'esp-js-ui';
import { registerTodoStore } from './stores/todoStore';
import { TodoView } from './views/todoView';

export const todoModule = ModuleBuilder
    .create('todo')
    .withContainerConfiguration((container: Container) => {

    })
    .withView('todo-store-id', TodoView, 'main')
    .withInitialisation(async (app: App) => {
        registerTodoStore(app.eventBus, 'todo-store-id');
    })
    .withStart(async (app: App) => {

    })
    .build();
