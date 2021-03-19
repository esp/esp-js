import {viewBinding} from 'esp-js-react';
import {ShellView} from '../views/shellView';
import {SplashScreenModel, SplashScreenState} from './splashScreenModel';
import {AggregateModuleLoadResult, IdFactory, Logger, ModelBase, ModuleChangeType, Shell, StatefulRegion, StateService, ModuleLoadStage} from 'esp-js-ui';
import {TradingModule} from '../../trading-module/tradingModule';
import {observeEvent} from 'esp-js';
import {ShellEvents} from '../events';
import {BlotterModule} from '../../blotter-module/blotterModule';

const _log = Logger.create('ShellModel');

@viewBinding(ShellView)
export class ShellModel extends ModelBase {
    public splashScreen: SplashScreenModel;

    constructor(
        router,
        private _workspaceRegion: StatefulRegion,
        private _blotterRegion: StatefulRegion,
        private _stateService: StateService,
        private _shell: Shell
    ) {
        super(IdFactory.createId('shellModelId'), router);
        this.splashScreen = {
            state: SplashScreenState.Default
        };
    }

    observeEvents() {
        super.observeEvents();
        this._blotterRegion.observeEvents();
        this._workspaceRegion.observeEvents();
        // schedule a call on the routes dispatch loop for this model.
        // This ensure's any observers will get notified of state changes
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
                        this.splashScreen = {
                            state: SplashScreenState.Error,
                            message: `There has been an error loading the modules.  Please refresh`
                        };
                    });
                },
                () => {
                    _log.info(`Modules loaded`);
                }));
        });
        // Typically this might happen after login
        this._shell.load(TradingModule, BlotterModule);
    }

    get workspaceRegion() {
        return this._workspaceRegion;
    }

    get blotterRegion() {
        return this._blotterRegion;
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
}
