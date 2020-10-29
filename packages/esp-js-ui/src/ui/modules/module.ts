import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {ViewFactoryState} from './viewFactoryState';

export interface ModuleConstructor {
    new (container: Container) : Module;
}

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerViewFactories(viewRegistryModel:ViewRegistryModel);
    getViewFactories();
    loadViews(viewRegistryModel:ViewRegistryModel, viewStates: ViewFactoryState[]);
    unloadViews(): void;
    registerPrerequisites(register: PrerequisiteRegister): void;
}