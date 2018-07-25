import {DisposableBase} from 'esp-js';
import ComponentRegistryModel from '../components/componentRegistryModel';
import PrerequisiteRegistrar from './prerequisites/prerequisiteRegistrar';

interface Module extends DisposableBase {

    initialise(): void;

    configureContainer(): void;

    registerComponents(componentRegistryModel:ComponentRegistryModel);

    getComponentsFactories();

    loadLayout(layoutMode:string);

    unloadLayout(): void;

    registerPrerequisites(registrar: PrerequisiteRegistrar): void;
}

export default Module;