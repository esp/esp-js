import * as Rx from 'rx';
import { Container } from 'microdi-js';
import ComponentRegistryModel from '../components/componentRegistryModel';
import StateService from '../state/stateService';
import Logger from '../../core/logger';
import ModuleDescriptor from './moduleDescriptor';
import {ModuleLoadResult} from './moduleLoadResult';
import SingleModuleLoader from './singleModuleLoader';

let _log = Logger.create('ModuleLoader');

export default class ModuleLoader {
    private _modules: Array<{moduleLoader: SingleModuleLoader, name: string}> = [];

    constructor(
        private _container: Container,
        private _componentRegistryModel: ComponentRegistryModel,
        private _stateService:StateService) {
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public loadModules(...functionalModules: ModuleDescriptor[]): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug('loading modules');

            let moduleLoaders = functionalModules.map(descriptor => {
                let singleModuleLoader = new SingleModuleLoader(
                    this._container,
                    this._componentRegistryModel,
                    this._stateService,
                    descriptor);
                
                this._modules.push({
                    moduleLoader: singleModuleLoader, name: descriptor.moduleName
                });
                
                return singleModuleLoader;
            });
            
            return Rx.Observable.concat(moduleLoaders.map(m => m.load())).subscribe(obs);
        });
    }

    public unloadModules(): void {
        // all modules' container are child containers of the service container (see notes above)
        this._modules
            .forEach(moduleItem => {
                _log.debug(`Unloading module ${moduleItem.name}`);
                moduleItem.moduleLoader.functionalModule.unloadLayout();
                moduleItem.moduleLoader.functionalModule.dispose();
            });
        this._modules.length = 0;
    }

    public loadLayout(layoutMode:string): void {
        this._modules.forEach(moduleItem => {
            _log.debug(`Loading layout for ${moduleItem.name}`);
            moduleItem.moduleLoader.functionalModule.loadLayout(layoutMode);
        });
}
