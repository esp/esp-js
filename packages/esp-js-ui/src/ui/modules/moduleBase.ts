import {Container} from 'esp-js-di';
import {DisposableBase, Guard} from 'esp-js';
import {StateService} from '../state';
import {ComponentRegistryModel, ComponentFactoryBase} from '../components';
import {Logger} from '../../core';
import {PrerequisiteRegister} from './prerequisites';
import {Module} from './module';
import {ComponentFactoryState} from './componentFactoryState';
import {ModelBase} from '../modelBase';
import {StateSaveMonitor} from '../state/stateSaveMonitor';
import {ModuleMetadata} from './moduleDecorator';
import {EspDecoratorUtil} from 'esp-js';
import {espModuleMetadataKey} from './moduleDecorator';

const _log: Logger = Logger.create('ModuleBase');

export abstract class ModuleBase extends DisposableBase implements Module {
    private _currentLayout: string = null;
    private readonly _stateSaveMonitor: StateSaveMonitor;
    private readonly _moduleMetadata: ModuleMetadata;

    protected constructor(
        protected readonly container: Container,
        private readonly _stateService: StateService
    ) {
        super();
        Guard.isDefined(container, 'container must be defined');
        Guard.isDefined(_stateService, '_stateService must be defined');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);
        this._moduleMetadata = EspDecoratorUtil.getCustomData(ModuleBase, espModuleMetadataKey);
        Guard.isDefined(this._moduleMetadata, `Module does not have an @espModule decorator. Name: ${ModuleBase.name}`);
        if (this.stateSavingEnabled && this.stateSaveIntervalMs > 0) {
            this._stateSaveMonitor = new StateSaveMonitor(this.stateSaveIntervalMs, this._saveAllComponentState);
            this.addDisposable(this._stateSaveMonitor);
        }
    }

    /**
     * if true automatic state saving for all the modules models using the provided StateService will apply
     */
    protected get stateSavingEnabled(): boolean {
        return false;
    }

    /**
     * The interval of which this module will save state
     */
    protected get stateSaveIntervalMs(): number {
        return 60_000;
    }

    protected abstract getDefaultStateProvider?();

    abstract configureContainer();

    abstract registerPrerequisites(register: PrerequisiteRegister): void;

    // override if required
    initialise(): void {
        if (this.stateSavingEnabled) {
            this._stateSaveMonitor.start();
        }
    }

    registerComponents(componentRegistryModel: ComponentRegistryModel) {
        _log.debug('Registering components');
        let componentFactories: Array<ComponentFactoryBase<any>> = this.getComponentsFactories();
        componentFactories.forEach(componentFactory => {
            componentRegistryModel.registerComponentFactory(this._moduleMetadata.moduleName, componentFactory);
            this.addDisposable(() => {
                componentRegistryModel.unregisterComponentFactory(componentFactory);
            });
        });
    }

    // override if required
    getComponentsFactories(): Array<ComponentFactoryBase<ModelBase>> {
        return [];
    }

    loadLayout(layoutMode: string, componentRegistryModel: ComponentRegistryModel) {
        if (this._currentLayout) {
            this.unloadLayout();
        }
        this._currentLayout = layoutMode;
        let componentFactoriesState = this._stateService.getModuleState<ComponentFactoryState[]>(this._moduleMetadata.moduleKey, this._currentLayout);
        if (componentFactoriesState === null) {
            Guard.isDefined(this.getDefaultStateProvider(), `_defaultStateProvider was not provided for module ${this._moduleMetadata.moduleKey}`);
            componentFactoriesState = this.getDefaultStateProvider().getComponentFactoriesState(layoutMode);
        }

        if (componentFactoriesState) {
            componentFactoriesState.forEach((componentFactoryState: ComponentFactoryState) => {
                if (componentRegistryModel.hasComponentFacotory(componentFactoryState.componentFactoryKey)) {
                    let componentFactory: ComponentFactoryBase<ModelBase> = componentRegistryModel.getComponentFactory(componentFactoryState.componentFactoryKey);
                    componentFactoryState.componentsState.forEach((state: any) => {
                        componentFactory.createComponent(state);
                    });
                } else {
                    // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
                    _log.warn(`Skipping load for component as it's factory of type [${componentFactoryState.componentFactoryKey}] is not registered`);
                }
            });
        }
    }

    unloadLayout() {
        if (!this._currentLayout) {
            return;
        }
        if (this.stateSavingEnabled) {
            this._saveAllComponentState();
        }
        this.getComponentsFactories().forEach((factory: ComponentFactoryBase<ModelBase>) => {
            factory.shutdownAllComponents();
        });
        this._currentLayout = null;
    }

    _saveAllComponentState = () => {
        if (this._currentLayout == null) {
            return;
        }
        let state = this.getComponentsFactories()
            .map(f => f.getAllComponentsState())
            .filter(f => f != null);
        if (state.length > 0) {
            this._stateService.saveModuleState(this._moduleMetadata.moduleKey, this._currentLayout, state);
        } else {
            this._stateService.clearModuleState(this._moduleMetadata.moduleKey, this._currentLayout);
        }
    }
}