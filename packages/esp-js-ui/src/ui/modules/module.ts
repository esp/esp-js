import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';

/**
 * Constructor delegate for a module.
 */
export interface ModuleConstructor {
    /**
     * Creates the module
     * @param container A child container of the applications root container.
     */
    new (container: Container) : Module;
}

/**
 * A pluggable module which can be plugged into an application.
 *
 * Modules must be decorated with a @espModule so static metadata can be obtained.
 *
 * Modules are containers for user views, they have there own load logic and ultimately can be deployed and plugged in at runtime if required.
 *
 * Deployment and dynamic fetching not ESPs responsibility, however once you've sourced a `ModuleConstructor` you can load it dynamically into esp-js-ui.
 */
export interface Module extends DisposableBase {
    /**
     * Hook to signal the module is about to be used
     */
    initialise(): void;

    /**
     * Called to enable the module to configure all it's container dependencies.
     */
    configureContainer(): void;

    /**
     * Called so the module can register any of it's `ViewFactory`s with the application
     */
    registerViewFactories(viewRegistryModel:ViewRegistryModel);

    getViewFactories();

    /**
     * Called so the module can register any async initialisation prerequisites.
     *
     * No views will be created/restored until these prerequisites have finished loading.
     */
    registerPrerequisites(register: PrerequisiteRegister): void;

    /**
     * Called after the module infrastructure has finished loading any views via default or persisted state
     */
    onViewsLoaded();
}