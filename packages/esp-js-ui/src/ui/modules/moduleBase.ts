import {Container} from 'esp-js-di';
import {DisposableBase, Guard} from 'esp-js';
import {StateService} from '../state';
import {ComponentRegistryModel, ComponentFactoryBase} from '../components';
import {Logger} from '../../core';
import {PrerequisiteRegistrar} from './prerequisites';
import {Module} from './module';
import {DefaultStateProvider} from './defaultStateProvider';
import {ComponentFactoryState} from './componentFactoryState';
import {ModelBase} from '../modelBase';
import {StateSaveMonitor} from '../state/stateSaveMonitor';

const _log: Logger = Logger.create('ModuleBase');

export abstract class ModuleBase extends DisposableBase implements Module {
    private _currentLayout: string = null;
    private _stateSaveMonitor: StateSaveMonitor;

    constructor(
        public readonly moduleKey,
        protected readonly container: Container,
        private readonly _stateService: StateService,
        private readonly _defaultStateProvider?: DefaultStateProvider) {

        super();
        Guard.isString(moduleKey, 'moduleKey must a string');
        Guard.isDefined(container, 'container must be defined');
        Guard.isDefined(_stateService, '_stateService must be defined');
        // seems to make sense for the module to own it's container,
        // disposing the module will dispose it's container and thus all it's child components.
        this.addDisposable(container);

        if (this.stateSavingEnabled && this.stateSaveIntervalMs > 0) {
            this._stateSaveMonitor = new StateSaveMonitor(this.stateSaveIntervalMs, this._saveAllComponentState);
            this.addDisposable(this._stateSaveMonitor);
        }
    }

    public get moduleName(): string { return ''; }

    // override if you want to have automatic state saving for your module
    protected get stateSavingEnabled(): boolean {
        return false;
    }

    // override if required
    protected get stateSaveIntervalMs(): number {
        return 60_000;
    }

    abstract configureContainer();

    abstract registerPrerequisites(registrar: PrerequisiteRegistrar): void;

    registerComponents(componentRegistryModel: ComponentRegistryModel) {
        _log.debug('Registering components');
        let componentFactories: Array<ComponentFactoryBase<any>> = this.getComponentsFactories();
        componentFactories.forEach(componentFactory => {
            componentRegistryModel.registerComponentFactory(this.moduleName, componentFactory);
            this.addDisposable(() => {
                componentRegistryModel.unregisterComponentFactory(componentFactory);
            });
        });
    }

    // override if required
    getComponentsFactories(): Array<ComponentFactoryBase<ModelBase>> {
        return [];
    }

    // override if required
    initialise(): void {
        if (this.stateSavingEnabled) {
            this._stateSaveMonitor.start();
        }
    }

    loadLayout(layoutMode: string, componentRegistryModel: ComponentRegistryModel) {
        if (this._currentLayout) {
            this.unloadLayout();
        }
        this._currentLayout = layoutMode;
        let componentFactoriesState = this._stateService.getModuleState<ComponentFactoryState[]>(this.moduleKey, this._currentLayout);
        if (componentFactoriesState === null && this._defaultStateProvider) {
            Guard.isDefined(this._defaultStateProvider, `_defaultStateProvider was not provided for module ${this.moduleKey}`);
            componentFactoriesState = this._defaultStateProvider.getComponentFactoriesState(layoutMode);
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
            this._stateService.saveModuleState(this.moduleKey, this._currentLayout, state);
        } else {
            this._stateService.clearModuleState(this.moduleKey, this._currentLayout);
        }
    }
}