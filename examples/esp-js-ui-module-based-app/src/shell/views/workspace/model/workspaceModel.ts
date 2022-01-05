import {viewBinding} from 'esp-js-react';
import {observeEvent} from 'esp-js';
import {
    AggregateModuleLoadResult,
    IdFactory,
    Logger,
    ModelBase,
    ModuleChangeType,
    Shell,
    StatefulRegion,
    StateService,
    ModuleLoadStage,
    Region,
} from 'esp-js-ui';
import {SplashScreenModel, SplashScreenState} from './splashScreenModel';
import {WorkspaceView} from '../views/workspaceView';
import {TradingModule} from '../../../../trading-module/tradingModule';
import {ShellEvents} from '../../../events';
import {BlotterModule} from '../../../../blotter-module/blotterModule';
import {AppPreferencesViewFactory} from '../../preferences';

const _log = Logger.create('WorkspaceModel');

@viewBinding(WorkspaceView)
export class WorkspaceModel extends ModelBase {
    private _splashScreen: SplashScreenModel;

    constructor(
        router,
        private _workspaceRegion: StatefulRegion,
        private _blotterRegion: StatefulRegion,
        private _modalRegion: Region,
        private _appPreferencesModelViewFactory: AppPreferencesViewFactory,
        private _stateService: StateService,
        private _shell: Shell
    ) {
        super(IdFactory.createId('workspaceModelId'), router);
        this._splashScreen = {
            state: SplashScreenState.Default
        };
    }

    observeEvents() {
        super.observeEvents();
        this._blotterRegion.observeEvents();
        this._workspaceRegion.observeEvents();
        this._modalRegion.observeEvents();
        // schedule a call on the routes dispatch loop for this model.
        // This ensures any observers will get notified of state changes
        this.ensureOnDispatchLoop(() => {
            this.addDisposable(this._shell.moduleLoadResults.subscribe((aggregateModuleLoadResult: AggregateModuleLoadResult) => {
                    let currentModuleLoadResult = aggregateModuleLoadResult.currentModuleLoadResult;
                    _log.debug(`Load Change detected for ${currentModuleLoadResult.moduleKey}, stage: ${ModuleLoadStage[currentModuleLoadResult.stage]}`);
                    if (currentModuleLoadResult.type === ModuleChangeType.Error) {
                        _log.error(`Pre-requisite failed. Module ${currentModuleLoadResult.moduleKey}, Pre-requisite: ${currentModuleLoadResult.prerequisiteResult.name}, Error: ${currentModuleLoadResult.errorMessage}`);
                    }
                },
                e => {
                    _log.error(`Error in the module load stream ${e}.`, e);
                    this.ensureOnDispatchLoop(() => {
                        this._splashScreen = {
                            state: SplashScreenState.Error,
                            message: `There has been an error loading the modules.  Please refresh`
                        };
                    });
                },
                () => {
                    _log.info(`Modules loaded`);
                }));
        });
        // Typically, this might happen after login
        this._shell.load(TradingModule, BlotterModule);
    }

    get splashScreen() {
        return this._splashScreen;
    }

    get workspaceRegion() {
        return this._workspaceRegion;
    }

    get blotterRegion() {
        return this._blotterRegion;
    }

    get modalRegion() {
        return this._modalRegion;
    }

    @observeEvent(ShellEvents.clearStateAndReload)
    private _clearStateAndReload() {
        _log.info(`Clearing state and reloading`);
        let canUnload = false;
        try {
            this._workspaceRegion.unload();
            this._blotterRegion.unload();
            this._stateService.clearState(this._shell.appStateKey);
            canUnload = true;
        } catch (e) {
            _log.error(`Error unloading`, e);
        }
        if (canUnload) {
            window.location.reload();
        }
    }

    @observeEvent(ShellEvents.showPreferences)
    private _showPreferences() {
        this._appPreferencesModelViewFactory.createView();
    }
}
