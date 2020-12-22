import {ViewState} from '../../viewFactory';

export interface RegionState<TViewState extends ViewState<object>> {
    regionName: string;
    /**
     * Provides a version for the regions state.
     * You can set this to 1 until you need to change.
     * At some future point, you may modify the regions state model and need to migrate state from an older version to a newer one.
     * You'd typically do this by overriding the call to `region.getRegionState(regionState)`
     */
    stateVersion: number;
    viewState: TViewState[];
}
