import {RegionBase} from './regionBase';
import {Router} from 'esp-js';
import {RegionManager} from './regionManager';
import {RegionState} from './regionState';
import {ViewRegistryModel, ViewState} from '../../viewFactory';
import {RegionItemRecord} from './regionItemRecord';

export class Region extends RegionBase<ViewState<object>, RegionState<ViewState<object>>> {
    constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager,
        protected _viewRegistry: ViewRegistryModel,
    ) {
        super(_regionName, router, _regionManager, _viewRegistry);
    }

    get stateSavingEnabled(): boolean {
        return false;
    }

    getRegionState(): RegionState<ViewState<object>> {
        throw new Error(`Not supported, use StatefulRegion or derive from RegionBase`);
    }

    protected createViewState(regionItemRecord: RegionItemRecord, modelState): ViewState<object> {
        throw new Error(`Not supported, use StatefulRegion or derive from RegionBase`);
    }
}