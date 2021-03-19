import {Module} from './module';

export interface ModuleProvider {
    /**
     * Returns the module if it's been loaded by the shell, else null
     * @param moduleKey The module key as decorated via the `@espModule(key, name)` decorator.
     */
    getModule(moduleKey: string): Module;
}