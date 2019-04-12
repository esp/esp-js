import {Container} from 'esp-js-di';
import {StateService} from '../state';
import {Module} from './module';

/**
 * Provides a description of a module which can be created via a constructor given by factory.
 */
export interface ModuleDescriptor  {
    /**
     *  The constructor for the Module, typically the class with a constructor matching the signature below
     *
     */
    factory: {
        new(container: Container, stateService: StateService): Module;
    };

    /**
     * The modules name. Doesn't need to be unique but helps for debugging.
     */
    moduleName: string;

    /**
     * An optional list of permissions associated with this module.
     *
     * These can be statically declared and optionally queried by custom code at module load time.
     */
    permissions?: Array<string>;
}