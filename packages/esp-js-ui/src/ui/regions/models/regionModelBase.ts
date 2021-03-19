import {Router} from 'esp-js';
import {RegionManager} from './regionManager';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';

/**
 * @deprecated Please use Region and/or RegionBase
 */
export class RegionModelBase extends RegionBase {
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

    load(regionState: RegionState) {
        throw new Error(`Not supported, use StatefulRegion`);
    }

    public getRegionState(): RegionState {
        throw new Error(`Not supported, use StatefulRegion`);
    }
}