import {ModuleBase} from './moduleBase';
import {StateSaveMonitor, StateService} from '../state';
import {Container} from 'esp-js-di';
import {PrerequisiteRegister} from './prerequisites';
import {Logger} from '../../core';
import {SystemContainerConst} from '../dependencyInjection';
import {espModule} from './moduleDecorator';
import {Region, RegionManager, RegionState} from '../regions/models';
import {AppDefaultStateProvider, AppState, NoopAppDefaultStateProvider} from './appState';
import {ShellModule} from './shellModule';

const _log: Logger = Logger.create('ShellModule');

@espModule('shell-module', 'Shell Module')
export abstract class ShellModuleBase extends ModuleBase implements ShellModule {
    private readonly _stateSaveMonitor: StateSaveMonitor;
    protected _hasLoaded: boolean = false;

    protected constructor(container: Container, private _stateService: StateService) {
        super(container);

        if (this.stateSavingEnabled && this.stateSaveIntervalMs > 0) {
            this._stateSaveMonitor = new StateSaveMonitor(this.stateSaveIntervalMs, this.saveAllComponentState);
            this.addDisposable(this._stateSaveMonitor);
        }
    }

    /**
     * if true automatic state saving for all the modules models using the provided StateService will apply
     */
    get stateSavingEnabled(): boolean {
        return false;
    }

    /**
     * The interval at which state will be saved
     */
    get stateSaveIntervalMs(): number {
        return 60_000;
    }

    /**
     * A unique key to identify the app, this may end up prefixed to items keyed in localStorage
     */
    abstract get appStateKey(): string;

    getDefaultStateProvider(): AppDefaultStateProvider {
        return NoopAppDefaultStateProvider;
    }

    private get _stateKey(): string {
        return `${this.appStateKey}`;
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

    loadViews() {
        _log.debug(`Loading views`);
        if (this._hasLoaded) {
            _log.debug(`First unloading existing views`);
            this.unloadViews();
        }
        this._hasLoaded = true;
        let applicationState: AppState = this._stateService.getState<AppState>(this._stateKey);
        if (!applicationState) {
            applicationState = this.getDefaultStateProvider().getDefaultAppState();
        }
        if (applicationState && applicationState.regionState.length > 0) {
            applicationState.regionState.forEach(regionState => {
                this._regionManager.loadRegion(regionState);
            });
        }
    }

    unloadViews() {
        if (!this._hasLoaded) {
            return;
        }
        if (this.stateSavingEnabled) {
            this.saveAllComponentState();
        }
        this._regionManager.getRegions().forEach((region: Region) => {
            region.unload();
        });
    }

    saveAllComponentState = () => {
        if (!this._hasLoaded) {
            return;
        }
        let appState: AppState = { regionState: [] };
        this._regionManager.getRegions().forEach(region => {
            let regionState: RegionState = region.getRegionState();
            if (regionState) {
                appState.regionState.push(regionState);
            }
        });
        if (appState.regionState.length > 0) {
            this._stateService.saveState(this._stateKey, appState);
        } else {
            this._stateService.clearState(this._stateKey);
        }
    };
}