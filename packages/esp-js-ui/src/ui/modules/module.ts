import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {ShellModule} from './shellModule';

export interface ModuleConstructor {
    new (container: Container) : Module;
}

export interface ShellModuleConstructor {
    new (container: Container) : ShellModule;
}

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerViewFactories(viewRegistryModel:ViewRegistryModel);
    getViewFactories();
    registerPrerequisites(register: PrerequisiteRegister): void;
}