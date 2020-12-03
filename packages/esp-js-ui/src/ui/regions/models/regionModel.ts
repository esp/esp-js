import {RegionModelBase, RegionState} from './regionModelBase';
import {ViewState} from '../../viewFactory';

export class RegionModel extends RegionModelBase<RegionState> {
    public getRegionState(): RegionState {
        const viewStates =  Array
            .from(this.state.regionRecords.values())
            .map<ViewState<any>>(regionItemRecord => this.getViewState(regionItemRecord) )
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