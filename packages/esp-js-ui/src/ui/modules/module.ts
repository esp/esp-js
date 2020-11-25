import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {StateService} from '../state';
import {ViewFactoryState} from './viewFactoryState';

export interface ModuleConstructor {
    new (container: Container) : Module;
}

export interface ShellModuleConstructor {
    new (container: Container, stateService: StateService) : ShellModule;
}

export interface ShellModule extends Module {
    loadViews(defaultViewFactoryStates?: ViewFactoryState[]);
    unloadViews();
}

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerViewFactories(viewRegistryModel:ViewRegistryModel);
    getViewFactories();
    registerPrerequisites(register: PrerequisiteRegister): void;
}