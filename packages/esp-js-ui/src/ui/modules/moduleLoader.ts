import * as Rx from 'rx';
import { Container } from 'esp-js-di';
import { ViewRegistryModel} from '../viewFactory';
import {StateService} from '../state/stateService';
import {Logger} from '../../core';
import {ModuleLoadResult} from './moduleLoadResult';
import {SingleModuleLoader} from './singleModuleLoader';
import {ModuleConstructor} from './module';
import {EspDecoratorUtil} from 'esp-js';
import {espModuleMetadataKey} from './moduleDecorator';
import {Guard} from 'esp-js';

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
    public loadModules(...moduleConstructors: Array<ModuleConstructor>): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading ${moduleConstructors.length} modules`);

            return Rx.Observable
                .concat(moduleConstructors.map(moduleCtor => this.loadModule(moduleCtor)))
                .subscribe(obs);
        });
    }

    public loadModule(moduleConstructor: ModuleConstructor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            let moduleLoader = this._createModuleLoader(moduleConstructor);
            return moduleLoader.load().subscribe(obs);
        });
    }

    public unloadModule(moduleKey: string): void {
        let moduleLoader = this._moduleLoaders.find(m => m.moduleMetadata.moduleKey === moduleKey);

        if (!moduleLoader) {
            throw new Error(`Module ${moduleKey} could not be found in registry`);
        }

        _log.debug(`'Unloading module ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
        moduleLoader.unloadModuleLayout();
        moduleLoader.disposeModule();

        this._moduleLoaders.splice(this._moduleLoaders.indexOf(moduleLoader), 1);
    }

    public loadLayout(layoutMode:string): void {
        this._moduleLoaders.forEach(moduleLoader => {
            _log.debug(`Loading layout for ${moduleLoader.moduleMetadata.moduleKey} with name ${moduleLoader.moduleMetadata.moduleName}`);
            moduleLoader.loadModuleLayout(layoutMode);
        });
    }

    private _createModuleLoader(moduleConstructor: ModuleConstructor): SingleModuleLoader {
        let moduleMetadata = EspDecoratorUtil.getCustomData(moduleConstructor, espModuleMetadataKey);
        Guard.isDefined(moduleMetadata, `Module does not have an @espModule decorator. Name: ${moduleConstructor.name}`);
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
}
