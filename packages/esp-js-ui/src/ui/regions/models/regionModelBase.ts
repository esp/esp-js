import {Router} from 'esp-js';
import {RegionManager} from './regionManager';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';

/**
 * @deprecated Please use Region
 */
export class RegionModelBase extends RegionBase {
    constructor(
        protected _regionName : string,
        router: Router,
        protected _regionManager: RegionManager
    ) {
        super(_regionName, router, _regionManager, null);
    }

    load(regionState: RegionState) {
        throw new Error(`Not supported, use StatefulRegion`);
    }

    get stateSavingEnabled(): boolean {
        return false;
    }
}