import {DisposableBase} from 'esp-js';
import {ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Container} from 'esp-js-di';
import {ModuleLoadStage} from './moduleLoadResult';
import {ModuleMetadata} from './moduleDecorator';

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
     * The modules child container.
     */
    container: Container;

    /**
     * The metadata associated with the module.
     * Typically this is derived via the @espModule decorating the module.
     */
    moduleMetadata: ModuleMetadata;

    /**
     * The last set load stage
     */
    currentLoadStage: ModuleLoadStage;

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
     * Hook called by the module loader as this module's load stage changes.
     */
    onLoadStageChanged(stage: ModuleLoadStage);
}