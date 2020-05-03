import {Observable,  merge} from 'rxjs';
import { Container } from 'esp-js-di';
import { ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state/stateService';
import {Logger} from '../../core';
import {ModuleLoadResult} from './moduleLoadResult';
import {SingleModuleLoader} from './singleModuleLoader';
import {ModuleConstructor} from './module';
import {EspModuleDecoratorUtils} from './moduleDecorator';

const _log = Logger.create('ModuleLoader');

export class ModuleLoader {
    private _moduleLoaders: Array<SingleModuleLoader> = [];

    constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _stateService:StateService) {
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public loadModules(...moduleConstructors: Array<ModuleConstructor>): Observable<ModuleLoadResult> {
        return new Observable(obs => {
            _log.debug(`Loading ${moduleConstructors.length} modules`);
            return merge(...moduleConstructors.map(moduleCtor => this.loadModule(moduleCtor)))
                .subscribe(obs);
        });
    }

    public loadModule(moduleConstructor: ModuleConstructor): Observable<ModuleLoadResult> {
        return new Observable(obs => {
            let moduleLoader = this._createModuleLoader(moduleConstructor);
            return moduleLoader.load().subscribe(obs);
        });
    }

    public unloadModules(): void {
        _log.debug(`'Unloading all modules`);
        this._moduleLoaders.forEach(moduleLoader => {
            _log.debug(`'Unloading module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
            moduleLoader.unloadModuleLayout();
            moduleLoader.disposeModule();
        });
        this._moduleLoaders.length = 0;
    }

    public unloadModule(moduleKey: string): void {
        let moduleLoader = this._findModuleLoader(moduleKey);

        if (!moduleLoader) {
            throw new Error(`Module ${moduleKey} could not be found in registry`);
        }

        _log.debug(`'Unloading module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
        moduleLoader.unloadModuleLayout();
        moduleLoader.disposeModule();

        this._moduleLoaders.splice(this._moduleLoaders.indexOf(moduleLoader), 1);
    }

    public loadLayout(layoutMode: string, moduleKey: string): void;
    public loadLayout(layoutMode: string): void;
    public loadLayout(...args: any[]): void {
        const layoutMode = args[0];
        const moduleKey = args.length === 2 ? args[1] : null;
        if (moduleKey) {
            const moduleLoader = this._findModuleLoader(moduleKey);
            _log.debug(`Loading layout for single module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
            moduleLoader.loadModuleLayout(layoutMode);
        } else {
            _log.debug(`Loading layout ${layoutMode} for all modules`);
            this._moduleLoaders.forEach(moduleLoader => {
                _log.debug(`Loading layout for ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
                moduleLoader.loadModuleLayout(layoutMode);
            });
        }
    }

    private _createModuleLoader(moduleConstructor: ModuleConstructor): SingleModuleLoader {
        let moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleClass(moduleConstructor);
        _log.debug(`Creating module Loader for ${moduleMetadata.moduleKey}`);
        let moduleLoader = new SingleModuleLoader(
            this._container,
            this._viewRegistryModel,
            this._stateService,
            moduleConstructor,
            moduleMetadata
        );
        this._moduleLoaders.push(moduleLoader);
        return moduleLoader;
    }

    private _findModuleLoader(moduleKey: string) {
        return this._moduleLoaders.find(m => m.moduleMetadata.moduleKey === moduleKey);
    }
}
