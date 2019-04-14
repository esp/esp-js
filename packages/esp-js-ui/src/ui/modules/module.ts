import {DisposableBase} from 'esp-js';
import {ComponentRegistryModel} from '../components';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {StateService} from '../state/stateService';

export interface ModuleConstructor {
    new (container: Container, stateService: StateService) : Module;
}

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerComponents(componentRegistryModel:ComponentRegistryModel);
    getComponentsFactories();
    loadLayout(layoutMode:string, componentRegistryModel:ComponentRegistryModel);
    unloadLayout(): void;
    registerPrerequisites(register: PrerequisiteRegister): void;
}