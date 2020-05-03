import {viewBinding} from 'esp-js-react';
import {ShellView} from '../views/shellView';
import {SplashScreenModel, SplashScreenState} from './splashScreenModel';
import {
    Logger,
    ModelBase,
    MultiItemRegionModel,
    SingleItemRegionModel,
    ModuleLoader,
    IdFactory,
    ModuleLoadResult,
    ModuleChangeType,
    liftToEspObservable,
    EspRouterObservable,
    ValueAndModel
} from 'esp-js-ui';
import {TradingModule} from '../../trading-module/tradingModule';

const _log = Logger.create('ShellModel');

@viewBinding(ShellView)
export class ShellModel extends ModelBase {
    public splashScreen: SplashScreenModel;

    constructor(router,
                private _moduleLoader: ModuleLoader,
                private _workspaceRegion: MultiItemRegionModel,
                private _blotterRegion: SingleItemRegionModel
    ) {
        super(IdFactory.createId('shellModelId'), router);
        this.splashScreen = {
            state: SplashScreenState.Default
        };
    }

    public init() {
        this.ensureOnDispatchLoop(() => {
            this.splashScreen = {
                state: SplashScreenState.Loading,
                message: `Loading Modules`
            };

            let moduleLoadStream = this._moduleLoader.loadModules(TradingModule).pipe(
                liftToEspObservable(this.router, this.modelId)
            ) as EspRouterObservable<ModuleLoadResult, ShellModel>;

            this.addDisposable(moduleLoadStream.subscribe(
                ({value: moduleLoadResult, model} : ValueAndModel<ModuleLoadResult, ShellModel>) => {
                    _log.debug(`Load Change detected`, moduleLoadResult);

                    if (moduleLoadResult.type === ModuleChangeType.Error) {
                        _log.error(`Pre-requisite failed. Pre Req Name: ${moduleLoadResult.prerequisiteResult.name}, Error Message: ${moduleLoadResult.errorMessage}`);
                    } else {
                        this.splashScreen = {
                            state: SplashScreenState.Loading,
                            message: moduleLoadResult.description
                        };
                    }
                },
                e => {
                    _log.error(`Error in the module load stream.`, e);
                    this.splashScreen = {
                        state: SplashScreenState.Error,
                        message: `There has been an error loading the modules.  Please refresh`
                    };
                },
                () => {
                    _log.info(`Modules loaded, loading layout`);
                    this._moduleLoader.loadLayout('default-layout-mode');
                    this.splashScreen = {
                        state: SplashScreenState.Idle
                    };
                }
            ));
        });
    }

    observeEvents() {
        super.observeEvents();
        this._blotterRegion.observeEvents();
        this._workspaceRegion.observeEvents();
    }

    getTitle(): string {
        return 'Shell';
    }

    get workspaceRegion() {
        return this._workspaceRegion;
    }

    get blotterRegion() {
        return this._blotterRegion;
    }
}
