import {Region, RegionState} from './regionManager';
import {RegionModelBase} from './regionModelBase';
import {ViewState} from '../../viewFactory';

export class DefaultRegionModel  extends RegionModelBase<RegionState> implements Region {
    public getRegionState(): RegionState {
        const viewStates =  Array
            .from(this.state.regionRecords.values())
            .map<ViewState>(regionItemRecord => this.getViewState(regionItemRecord) )
            .filter(c => c != null);
        if (viewStates.length === 0) {
            return null;
        } else {
            return {
                regionName: this._regionName,
                stateVersion: this.stateVersion,
                viewState: viewStates,
            };
        }
    }
}