import {RegionRecordState} from '../../viewFactory';

export interface RegionState<TCustomState = any> {
    /**
     * The region name as registered with the RegionManager
     */
    regionName: string;
    /**
     * Provides a version for the regions state.
     * You can set this to 1 until you need to change.
     * At some future point, you may modify the regions state model and need to migrate state from an older version to a newer one.
     * You'd typically do this by overriding the call to `region.getRegionState(regionState)`
     */
    stateVersion: number;
    /**
     * Any additional region state which should be persisted
     */
    customState: TCustomState;
    /**
     * The state for the regions Views
     */
    regionRecordStates: RegionRecordState[];
}
