import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {StateService} from '../state/stateService';

export interface ModuleConstructor {
    new (container: Container, stateService: StateService) : Module;
}

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerViewFactories(viewRegistryModel:ViewRegistryModel);
    getViewFactories();
    loadLayout(layoutMode:string, viewRegistryModel:ViewRegistryModel);
    unloadLayout(): void;
    registerPrerequisites(register: PrerequisiteRegister): void;
}