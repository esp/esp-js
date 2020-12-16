import {RegionBase} from './regionBase';
import {Router} from 'esp-js';
import {RegionManager} from './regionManager';
import {RegionState} from './regionState';
import {ViewRegistryModel} from '../../viewFactory';

export class Region extends RegionBase {
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

    getRegionState(): RegionState {
        throw new Error(`Not supported, use StatefulRegion`);
    }
}