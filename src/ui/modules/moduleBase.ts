import { Container } from 'microdi-js';
import {DisposableBase} from 'esp-js';
import StateService from '../state/stateService';
import ComponentRegistryModel from '../components/componentRegistryModel';
import ComponentFactoryBase from '../components/componentFactoryBase';
import Logger from '../../core/logger';
import Guard from '../../core/guard';
import PrerequisiteRegistrar from './prerequisites/prerequisiteRegistrar';
import Module from './module';

export interface ComponentFactoryState {
    componentFactoryKey:string;
    componentsState: Array<any>;
}

export interface DefaultStateProvider {
    getComponentFactoriesState(layoutMode:string):Array<ComponentFactoryState>;
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
        // seems to make sense for the functionalModule to own it's container,
        // disposing the functionalModule will dispose it's container and thus all it's child components.
        this.addDisposable(container);
    }

    abstract configureContainer();

    abstract registerPrerequisites(registrar: PrerequisiteRegistrar): void;

    registerComponents(componentRegistryModel:ComponentRegistryModel) {
        this._log.debug('Registering components');
        let componentFactories:Array<ComponentFactoryBase> = this.getComponentsFactories();
        componentFactories.forEach(componentFactory => {
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
        let componentFactoriesState = this._stateService.getApplicationState<ComponentFactoryState[]>(this._moduleKey, this._currentLayout);
        if (componentFactoriesState === null && this._defaultStateProvider) {
            Guard.isDefined(this._defaultStateProvider, `_defaultStateProvider was not provided for module ${this._moduleKey}`);
            componentFactoriesState = this._defaultStateProvider.getComponentFactoriesState(layoutMode);
        }
        
        if(componentFactoriesState) {
            componentFactoriesState.forEach((componentFactoryState:ComponentFactoryState) => {
                let componentFactory:ComponentFactoryBase = this.container.resolve<ComponentFactoryBase>(componentFactoryState.componentFactoryKey);
                componentFactoryState.componentsState.forEach((state:any) => {
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
        let state = componentFactories
            .map(f => f.getAllComponentsState())
            .filter(f => f != null);
        if(state.length > 0) {
            this._stateService.saveApplicationState(this._moduleKey, this._currentLayout, state);
        }
        componentFactories.forEach((factory: ComponentFactoryBase) => {
            factory.shutdownAllComponents();
        });
        this._currentLayout = null;
    }
}

export default ModuleBase;