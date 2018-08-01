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
    ModuleDescriptor
} from 'esp-js-ui';
import {TradingModule} from '../../trading-module/tradingModule';
import {ModuleChangeType} from '../../../../../packages/esp-js-ui/src/ui/modules';

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

            let permissions = ['fx-trading']; // hardcoded
            let modulesToLoad: ModuleDescriptor[] = [];
            if (permissions.indexOf(TradingModule.requiredPermission) >= 0) {
                let descriptor: ModuleDescriptor = {
                    factory: TradingModule,
                    moduleName: 'Trading Module'
                };
                modulesToLoad.push(descriptor);
            }

            let loadModules = this._moduleLoader.loadModules(modulesToLoad);
            this.addDisposable(loadModules.subscribeWithRouter(this.router, this.modelId, (change: ModuleLoadResult) => {
                    _log.debug(`Load Change detected`, change);

                    if (change.type === ModuleChangeType.Error) {
                        _log.error(`Pre-requisite failed. Pre Req Name: ${change.prerequisiteResult.name}, Error Message: ${change.errorMessage}`);
                    } else {
                        this.splashScreen = {
                            state: SplashScreenState.Loading,
                            message: change.description
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
                }));
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
