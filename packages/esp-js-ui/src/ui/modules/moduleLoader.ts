import * as Rx from 'rx';
import { Container } from 'esp-js-di';
import { ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state/stateService';
import {Logger} from '../../core';
import {ModuleLoadResult} from './moduleLoadResult';
import {SingleModuleLoader} from './singleModuleLoader';
import {ModuleConstructor} from './module';
import {EspModuleDecoratorUtils} from './moduleDecorator';
import {Router} from 'esp-js';
import {IdFactory} from '../idFactory';

const _log = Logger.create('ModuleLoader');

export class ModuleLoader {
    private _moduleLoaders: Array<SingleModuleLoader> = [];
    private _modalLoaderModelId = IdFactory.createId('module-loader');

    constructor(
        private _container: Container,
        private _viewRegistryModel: ViewRegistryModel,
        private _stateService:StateService,
        private _router: Router
    ) {
        // This is somewhat of a hack to avoid a race condition whereby modules that load very quickly don't allow the view registry model to process the new view factories before the modules loadLayout is called.
        // Effectively loadLayout is called right away and it can't find any of the 'enqueued to be registered' view factories.
        // The below 'ghost model' is used to pop the load layout call onto the back of the dispatch loop which will allow the router to train all other models and thus populate the view factories.
        // The proper fix for this is to make the ModuleLoader a true esp model, however I don't want to do that in the 2.0 code base as it's using the older version of rx.
        // I think this is a likely refactor for esp 4.
        this._router.addModel(this._modalLoaderModelId, {});
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public loadModules(...moduleConstructors: Array<ModuleConstructor>): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading ${moduleConstructors.length} modules`);
            return Rx.Observable
                .merge(moduleConstructors.map(moduleCtor => this.loadModule(moduleCtor)))
                .subscribe(obs);
        });
    }

    public loadModule(moduleConstructor: ModuleConstructor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
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
        this._router.runAction(this._modalLoaderModelId, () => {
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
        });
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