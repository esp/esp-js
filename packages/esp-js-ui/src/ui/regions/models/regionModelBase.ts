import {Router} from 'esp-js';
import {RegionManager} from './regionManager';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';
import {ViewState} from '../../viewFactory';
import {RegionItemRecord} from './regionItemRecord';

/**
 * @deprecated Please use Region
 */
export class RegionModelBase extends RegionBase<ViewState<object>, RegionState<ViewState<object>>> {
    constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager
    ) {
        super(_regionName, router, _regionManager, null);
    }

    get stateSavingEnabled(): boolean {
        return false;
    }

    load(regionState: RegionState<ViewState<object>>) {
        throw new Error(`Not supported, use StatefulRegion`);
    }

    protected createViewState(regionItemRecord: RegionItemRecord, modelState): ViewState<object> {
        throw new Error(`Not supported, use StatefulRegion`);
    }

    public getRegionState(): RegionState<ViewState<object>> {
        throw new Error(`Not supported, use StatefulRegion`);
    }
}