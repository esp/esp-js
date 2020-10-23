import {Container} from 'esp-js-di';
import {DisposableBase, Guard} from 'esp-js';
import {StateService} from '../state';
import {ViewRegistryModel, ViewFactoryBase} from '../viewFactory';
import {Logger} from '../../core';
import {PrerequisiteRegister} from './prerequisites';
import {Module} from './module';
import {ViewFactoryState} from './viewFactoryState';
import {ModelBase} from '../modelBase';
import {StateSaveMonitor} from '../state/stateSaveMonitor';
import {ModuleMetadata} from './moduleDecorator';
import {DefaultStateProvider} from './defaultStateProvider';
import {EspModuleDecoratorUtils} from './moduleDecorator';

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
        this._moduleMetadata = EspModuleDecoratorUtils.getMetadataFromModuleInstance(this);
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

    protected getDefaultStateProvider(): DefaultStateProvider {
        return null;
    }

    abstract configureContainer();

    abstract registerPrerequisites(register: PrerequisiteRegister): void;

    // override if required
    initialise(): void {
        if (this.stateSavingEnabled) {
            this._stateSaveMonitor.start();
        }
    }

    registerViewFactories(viewRegistryModel: ViewRegistryModel) {
        _log.debug('Registering views');
        let viewFactories: Array<ViewFactoryBase<any>> = this.getViewFactories();
        viewFactories.forEach(viewFactory => {
            viewRegistryModel.registerViewFactory(this._moduleMetadata.moduleKey, this._moduleMetadata.moduleName, viewFactory);
            this.addDisposable(() => {
                viewRegistryModel.unregisterViewFactory(viewFactory);
            });
        });
    }

    // override if required
    getViewFactories(): Array<ViewFactoryBase<ModelBase>> {
        return [];
    }

    loadLayout(layoutMode: string, viewRegistryModel: ViewRegistryModel) {
        if (this._currentLayout) {
            this.unloadLayout();
        }
        this._currentLayout = layoutMode;
        let viewFactoriesState = this._stateService.getModuleState<ViewFactoryState[]>(this._moduleMetadata.moduleKey, this._currentLayout);
        if (viewFactoriesState === null && this.getDefaultStateProvider()) {
            Guard.isDefined(this.getDefaultStateProvider(), `_defaultStateProvider was not provided for module ${this._moduleMetadata.moduleKey}`);
            viewFactoriesState = this.getDefaultStateProvider().getViewFactoriesState(layoutMode);
        }

        if (viewFactoriesState) {
            viewFactoriesState.forEach((viewFactoryState: ViewFactoryState) => {
                if (viewRegistryModel.hasViewFactory(viewFactoryState.viewFactoryKey)) {
                    let viewFactory: ViewFactoryBase<ModelBase> = viewRegistryModel.getViewFactory(viewFactoryState.viewFactoryKey);
                    viewFactoryState.state.forEach((state: any) => {
                        viewFactory.createView(state);
                    });
                } else {
                    // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
                    _log.warn(`Skipping load for component as it's factory of type [${viewFactoryState.viewFactoryKey}] is not registered`);
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
        this.getViewFactories().forEach((factory: ViewFactoryBase<ModelBase>) => {
            factory.shutdownAllViews();
        });
        this._currentLayout = null;
    }

    _saveAllComponentState = () => {
        if (this._currentLayout == null) {
            return;
        }
        let state = this.getViewFactories()
            .map(f => f.getAllViewsState())
            .filter(f => f != null);
        if (state.length > 0) {
            this._stateService.saveModuleState(this._moduleMetadata.moduleKey, this._currentLayout, state);
        } else {
            this._stateService.clearModuleState(this._moduleMetadata.moduleKey, this._currentLayout);
        }
    };
}