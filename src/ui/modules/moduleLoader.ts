import * as _ from 'lodash';
import { Container } from 'microdi-js';
import ComponentRegistryModel from '../components/componentRegistryModel';
import StateService from '../state/stateService';
import {ModuleConstructor, Module} from './moduleBase';
import Logger from '../../core/logger';

let _log = Logger.create('ModuleLoader');

export default class ModuleLoader {
    private _container :Container;
    private _componentRegistryModel :ComponentRegistryModel;
    private _modules :Array<Module>;
    private _stateService :StateService;

    constructor(
        container: Container,
        componentRegistryModel: ComponentRegistryModel,
        stateService:StateService) {
        this._container = container;
        this._componentRegistryModel = componentRegistryModel;
        this._modules = [];
        this._stateService = stateService;
    }

    /**
     * takes an array of modules class that will be new-ed up, i.e. constructor functions
     */
    loadModules<TModule extends ModuleConstructor>(...functionalModules:Array<TModule>) {
        _log.debug('starting modules');
        for (let i = 0; i < functionalModules.length; i++) {
            let FunctionalModule = functionalModules[i];
            let functionalModule = new FunctionalModule(
                this._container.createChildContainer(),
                this._stateService
            );
            this._modules.push(functionalModule);
        }
        this._configureModulesContainer();
        this._registerModulesComponents();
        this._initialiseModules();
    }
    unloadModules() {
        // note re reverse the modules here inorder to dispose the service module last,
        // all other modules container are child containers of the service container (see notes above)
        _(this._modules)
            .reverse()
            .forEach((module:Module) => {
                module.unloadLayout();
                module.dispose();
            });
        this._modules.length = 0;
    }
    loadLayout(layoutMode:string) {
        _.forEach(this._modules, (module:Module) => {
            module.loadLayout(layoutMode);
        });
    }
    _configureModulesContainer() {
        _.forEach(this._modules, (module:Module) => {
            module.configureContainer();
        });
    }
    _registerModulesComponents() {
        _.forEach(this._modules, (module:Module) => {
            module.registerComponents(this._componentRegistryModel);
        });
    }
    _initialiseModules() {
        _.forEach(this._modules, (module:Module) => {
            module.initialise();
        });
    }
}
