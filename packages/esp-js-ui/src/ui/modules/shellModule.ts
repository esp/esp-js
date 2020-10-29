import {ModuleBase} from './moduleBase';
import {StateSaveMonitor, StateService} from '../state';
import {Container} from 'esp-js-di';
import {ViewFactoryEntry, ViewRegistryModel} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';
import {ViewFactoryState} from './viewFactoryState';
import {Logger} from '../../core';
import {SystemContainerConst} from '../dependencyInjection';

const _log: Logger = Logger.create('ShellModule');

export abstract class ShellModule extends ModuleBase {
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

    private get _modulesPreviouslySeenList(): string {
        return `${this.appKey}-modules-previously-seen-list`;
    }

    private get _viewRegistryModel(): ViewRegistryModel {
        return this.container.resolve<ViewRegistryModel>(SystemContainerConst.views_registry_model);
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

    loadViews(defaultViewFactoryStates: ViewFactoryState[]) {
        _log.debug(`Loading views`);
        if (this._hasLoaded) {
            _log.debug(`First unloading existing views`);
            this.unloadViews();
        }
        this._hasLoaded = true;
        let modulesPreviouslySeenList = this._stateService.getState<string[]>(this._modulesPreviouslySeenList);
        let viewFactoryStates = this._stateService.getState<ViewFactoryState[]>(this._stateKey);

        // At this point we need to decide how much of defaultViewFactoryStates we should use.
        // If we've seen the users before it's possible we use non of it as what ever is in applicationState will take precedence
        // However there may be new modules in defaultViewFactoryStates which were not seen before.
        // If so we should merge that state into applicationState.

        if (viewFactoryStates) {
            defaultViewFactoryStates.forEach(viewFactoryState => {
                let isFirstTimeTheViewsModuleHasBeenSeen = !modulesPreviouslySeenList.includes(viewFactoryState.moduleKey);
                if (isFirstTimeTheViewsModuleHasBeenSeen) {
                    viewFactoryStates.push(viewFactoryState);
                }
            });
        } else {
            viewFactoryStates = defaultViewFactoryStates;
        }

        _log.debug(`Found state in state service, will use that rather than default state.`);
        // it's possible we have new default state for some modules, if that's the case we merge that in.
        if (viewFactoryStates) {
            viewFactoryStates.forEach((viewFactoryState: ViewFactoryState) => {
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
        let appState: ApplicationState = {};
        let viewFactoryEntries: ViewFactoryEntry[] = this._viewRegistryModel.getViewFactoryEntries();
        viewFactoryEntries.forEach(viewFactoryEntry => {
            let allViewsState: ViewFactoryState = viewFactoryEntry.factory.getAllViewsState();
            if (allViewsState) {
                let moduleState: any[] = appState[viewFactoryEntry.moduleKey];
                if (!moduleState) {
                    moduleState = [];
                    appState[viewFactoryEntry.moduleKey] = moduleState;
                }
                moduleState.push(allViewsState);
            }
        });
        if (Object.keys(appState).length > 0) {
            this._stateService.saveState(this.stateKey, appState);
        } else {
            this._stateService.clearState(this.stateKey);
        }
    };
}