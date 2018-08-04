import * as Rx from 'rx';
import { Container } from 'microdi-js';
import { ComponentRegistryModel} from '../components';
import {StateService} from '../state/stateService';
import {Logger} from '../../core';
import {ModuleDescriptor} from './moduleDescriptor';
import {ModuleLoadResult} from './moduleLoadResult';
import {SingleModuleLoader} from './singleModuleLoader';

const _log = Logger.create('ModuleLoader');

export class ModuleLoader {
    private _modules: Array<{moduleLoader: SingleModuleLoader, name: string}> = [];

    constructor(
        private _container: Container,
        private _componentRegistryModel: ComponentRegistryModel,
        private _stateService:StateService) {
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    public loadModules(moduleDescriptors: Array<ModuleDescriptor>): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading ${moduleDescriptors.length} modules`);

            return Rx.Observable
                .concat(moduleDescriptors.map(descriptor => this.loadModule(descriptor)))
                .subscribe(obs);
        });
    }

    public loadModule(moduleDescriptor: ModuleDescriptor): Rx.Observable<ModuleLoadResult> {
        return Rx.Observable.create<ModuleLoadResult>(obs => {
            _log.debug(`Loading module ${moduleDescriptor.moduleName}`);

            let moduleLoader = this._createModuleLoader(moduleDescriptor);
            return moduleLoader.load().subscribe(obs);
        });
    }

    public unloadModule(moduleName: string): void {
        let module = this._modules.find(m => m.name === moduleName);

        if (!module) {
            throw new Error(`Module ${moduleName} could not be found in registry`);
        }

        _log.debug(`'Unloading module ${module.name}`);
        module.moduleLoader.unloadModuleLayout();
        module.moduleLoader.disposeModule();

        this._modules.splice(this._modules.indexOf(module), 1);
    }

    public loadLayout(layoutMode:string): void {
        this._modules.forEach(moduleItem => {
            _log.debug(`Loading layout for ${moduleItem.name}`);
            moduleItem.moduleLoader.loadModuleLayout(layoutMode);
        });
    }

    private _createModuleLoader(moduleDescriptor: ModuleDescriptor): SingleModuleLoader {
        let moduleLoader = new SingleModuleLoader(
            this._container,
            this._componentRegistryModel,
            this._stateService,
            moduleDescriptor
        );

        this._modules.push({moduleLoader, name: moduleDescriptor.moduleName});

        return moduleLoader;
    }
}
