import * as _ from 'lodash';
import { Container } from 'microdi-js';
import {DisposableBase} from 'esp-js';
import StateService from '../state/stateService';
import ComponentRegistryModel from '../components/componentRegistryModel';
import ComponentFactoryBase from '../components/componentFactoryBase';
import Logger from '../../core/logger';
import Guard from '../../core/guard';

export interface ComponentFactoryState {
    componentFactoryKey:string;
    componentsState: Array<any>;
}

export interface DefaultStateProvider {
    getComponentFactoriesState(layoutMode:string):Array<ComponentFactoryState>;
}

export interface ModuleConstructor {
    new (container:Container, stateService:StateService) : Module;
}

export interface Module extends DisposableBase {

    initialise() : void;

    configureContainer() : void ;

    registerComponents(componentRegistryModel:ComponentRegistryModel);

    getComponentsFactories();

    loadLayout(layoutMode:string);

    unloadLayout() : void;
}

export abstract class ModuleBase extends DisposableBase implements Module {
    protected container:Container;
    private _stateService:StateService;
    private _moduleKey:string;
    private _currentLayout:string;
    private _log:Logger;
    private _defaultStateProvider:DefaultStateProvider;

    constructor(moduleKey, container:Container, stateService:StateService, defaultStateProvider?:DefaultStateProvider) {
        Guard.isString(moduleKey, 'moduleKey must a string');
        Guard.isDefined(container, 'container must be defined');
        Guard.isDefined(stateService, 'stateService must be defined');
        super();
        this._moduleKey = moduleKey;
        this.container = container;
        this._stateService = stateService;
        this._defaultStateProvider = defaultStateProvider;
        this._log = Logger.create('ModuleBase');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);
    }

    abstract configureContainer();

    registerComponents(componentRegistryModel:ComponentRegistryModel) {
        this._log.debug('Registering components');
        let componentFactories:Array<ComponentFactoryBase> = this.getComponentsFactories();
        _.forEach(componentFactories, componentFactory => {
            componentRegistryModel.registerComponentFactory(componentFactory);
            this.addDisposable(() => {
                componentRegistryModel.unregisterComponentFactory(componentFactory);
            });
        });
    }

    // override if required
    getComponentsFactories() : Array<ComponentFactoryBase> {
        return [];
    }

    // override if required
    initialise() : void {
    }

    loadLayout(layoutMode:string) {
        if (this._currentLayout) {
            this.unloadLayout();
        }
        this._currentLayout = layoutMode;
        let componentFactoriesState = this._stateService.getApplicationState(this._moduleKey, this._currentLayout);
        if (componentFactoriesState === null && this._defaultStateProvider) {
            Guard.isDefined(this._defaultStateProvider, `_defaultStateProvider was not provided for module ${this._moduleKey}`);
            componentFactoriesState = this._defaultStateProvider.getComponentFactoriesState(layoutMode);
        }
        if(componentFactoriesState) {
            _.forEach(componentFactoriesState, (componentFactoryState:ComponentFactoryState) => {
                let componentFactory:ComponentFactoryBase = this.container.resolve<ComponentFactoryBase>(componentFactoryState.componentFactoryKey);
                _.forEach(componentFactoryState.componentsState, (state:any) => {
                    componentFactory.createComponent(state);
                });
            });
        }
    }

    unloadLayout() {
        if (!this._currentLayout) {
            return;
        }
        let componentFactories:Array<ComponentFactoryBase> = this.getComponentsFactories();
        let state = _(componentFactories)
            .map(f => f.getAllComponentsState())
            .compact() // removes nulls
            .value();
        if(state.length > 0) {
            this._stateService.saveApplicationState(this._moduleKey, this._currentLayout, state);
        }
        _.forEach(componentFactories, (factory:ComponentFactoryBase) => {
            factory.shutdownAllComponents();
        });
        this._currentLayout = null;
    }
}

export default ModuleBase;