import {ModuleBase} from './moduleBase';
import {StateSaveMonitor, StateService} from '../state';
import {Container} from 'esp-js-di';
import {ViewFactoryEntry, ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {Logger} from '../../core';
import {SystemContainerConst} from '../dependencyInjection';
import {ShellModule} from './module';
import {espModule} from './moduleDecorator';
import {RegionItemState, RegionManager, RegionState} from '../regions/models';

const _log: Logger = Logger.create('ShellModule');

@espModule('shell-module', 'Shell Module')
export abstract class ShellModuleBase extends ModuleBase implements ShellModule {
    private readonly _stateSaveMonitor: StateSaveMonitor;
    protected _hasLoaded: boolean = false;

    protected constructor(container: Container, private _stateService: StateService) {
        super(container);

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

    /**
     * A unique key to identify the app, this may end up prefixed to items keyed in localStorage
     */
    protected abstract get appKey(): string;

    private get _stateKey(): string {
        return `${this.appKey}-state`;
    }

    private get _viewRegistryModel(): ViewRegistryModel {
        return this.container.resolve<ViewRegistryModel>(SystemContainerConst.views_registry_model);
    }

    private get _regionManager(): RegionManager {
        return this.container.resolve<RegionManager>(SystemContainerConst.region_manager);
    }

    configureContainer() {

    }

    registerPrerequisites(register: PrerequisiteRegister): void {

    }

    initialise(): void {
        if (this.stateSavingEnabled) {
            this._stateSaveMonitor.start();
        }
    }

    loadViews(defaultViewFactoryStates?: RegionItemState[]) {
        _log.debug(`Loading views`);
        if (this._hasLoaded) {
            _log.debug(`First unloading existing views`);
            this.unloadViews();
        }
        this._hasLoaded = true;
        let applicationState = this._stateService.getState<ViewFactoryState[]>(this._stateKey);

        // At this point we need to decide how much of defaultViewFactoryStates we should use.
        // If we've seen the users before it's possible we use non of it as what ever is in viewFactoryStates will take precedence
        // However there may be new modules in defaultViewFactoryStates which were not seen before.
        // If so we should merge that state into applicationState.

        if (defaultViewFactoryStates) {
            if (applicationState) {
                _log.debug(`Found applicationState via state service.`);
                let viewsPreviouslySeen = applicationState.map(vfs => vfs.viewFactoryKey);
                defaultViewFactoryStates.forEach(viewFactoryState => {
                    let firstTimeSeen = !viewsPreviouslySeen.includes(viewFactoryState.viewFactoryKey);
                    if (firstTimeSeen) {
                        applicationState.push(viewFactoryState);
                    }
                });
            } else {
                _log.debug(`No state in state service, will default state.`);
                applicationState = defaultViewFactoryStates;
            }
        }

        if (applicationState) {
            applicationState.forEach((viewFactoryState: ViewFactoryState) => {
                if (this._viewRegistryModel.hasViewFactory(viewFactoryState.viewFactoryKey)) {
                    let viewFactoryEntry: ViewFactoryEntry = this._viewRegistryModel.getViewFactoryEntry(viewFactoryState.viewFactoryKey);
                    viewFactoryState.state.forEach((state: any) => {
                        viewFactoryEntry.factory.createView(state);
                    });
                } else {
                    // It's possible the component factory isn't loaded, perhaps old state had a component which the users currently isn't entitled to see ATM.
                    _log.warn(`Skipping load for component as it's factory of type [${viewFactoryState.viewFactoryKey}] is not registered`);
                }
            });
        }
    }

    unloadViews() {
        if (!this._hasLoaded) {
            return;
        }
        if (this.stateSavingEnabled) {
            this._saveAllComponentState();
        }
        this._viewRegistryModel.getViewFactoryEntries().forEach((entry: ViewFactoryEntry) => {
            entry.factory.shutdownAllViews();
        });
    }

    _saveAllComponentState = () => {
        if (!this._hasLoaded) {
            return;
        }
        let appState: RegionState[] = [];
        this._regionManager.getRegions().forEach(region => {
            let regionState: RegionState = region.getRegionState();
            if (regionState) {
                appState.push(regionState);
            }
        });
        if (appState.length > 0) {
            this._stateService.saveState(this._stateKey, appState);
        } else {
            this._stateService.clearState(this._stateKey);
        }
    };
}