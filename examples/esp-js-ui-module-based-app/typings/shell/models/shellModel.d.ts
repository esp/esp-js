import { SplashScreenModel } from './splashScreenModel';
import { ModelBase, MultiItemRegionModel, SingleItemRegionModel, ModuleLoader } from 'esp-js-ui';
export declare class ShellModel extends ModelBase {
    private _moduleLoader;
    private _workspaceRegion;
    private _blotterRegion;
    splashScreen: SplashScreenModel;
    constructor(router: any, _moduleLoader: ModuleLoader, _workspaceRegion: MultiItemRegionModel, _blotterRegion: SingleItemRegionModel);
    init(): void;
    observeEvents(): void;
    getTitle(): string;
    readonly workspaceRegion: MultiItemRegionModel;
    readonly blotterRegion: SingleItemRegionModel;
}
