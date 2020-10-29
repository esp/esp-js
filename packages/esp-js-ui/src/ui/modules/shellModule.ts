import {ModuleBase} from './moduleBase';
import {StateSaveMonitor, StateService} from '../state';
import {Container} from 'esp-js-di';
import {ViewRegistryModel, ViewStateSet} from '../viewFactory';
import {PrerequisiteRegister} from './prerequisites';

export abstract class ShellModule extends ModuleBase {
    private readonly _stateSaveMonitor: StateSaveMonitor;

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

    protected abstract get stateKey(): string;

    configureContainer() {

    }

    registerPrerequisites(register: PrerequisiteRegister): void {

    }

    initialise(): void {
        if (this.stateSavingEnabled) {
            this._stateSaveMonitor.start();
        }
    }

    loadViews(viewRegistryModel: ViewRegistryModel) {
        let state = this._stateService.getState<ViewStateSet[]>(this.stateKey);
        super.loadViews(viewRegistryModel, state);
    }

    unloadViews() {
        if (this.stateSavingEnabled) {
            this._saveAllComponentState();
        }
        super.unloadViews();
    }

    _saveAllComponentState = () => {
        if (!this._hasLoaded) {
            return;
        }
        let state: ViewStateSet[] = this.getViewFactories()
            .map(f => f.getAllViewsState())
            .filter(f => f != null);
        if (state.length > 0) {
            this._stateService.saveState(this.stateKey, state);
        } else {
            this._stateService.clearState(this.stateKey);
        }
    };
}