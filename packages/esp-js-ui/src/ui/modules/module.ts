import {DisposableBase} from 'esp-js';
import {ComponentRegistryModel} from '../components';
import {PrerequisiteRegistrar} from './prerequisites';

export interface Module extends DisposableBase {
    initialise(): void;
    configureContainer(): void;
    registerComponents(componentRegistryModel:ComponentRegistryModel);
    getComponentsFactories();
    loadLayout(layoutMode:string);
    unloadLayout(): void;
    registerPrerequisites(registrar: PrerequisiteRegistrar): void;
}