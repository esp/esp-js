import {ViewState} from '../../viewFactory';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';

export class StatefulRegion<TRegionState extends RegionState = RegionState> extends RegionBase<TRegionState> {
    public get stateSavingEnabled(): boolean {
        return true;
    }

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