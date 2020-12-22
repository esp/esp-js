import {ViewState} from '../../viewFactory';
import {RegionBase} from './regionBase';
import {RegionState} from './regionState';
import {RegionItemRecord} from './regionItemRecord';

export class StatefulRegion extends RegionBase<ViewState<object>, RegionState<ViewState<object>>> {
    public get stateSavingEnabled(): boolean {
        return true;
    }

    public getRegionState(): RegionState<ViewState<object>> {
        const viewStates =  Array
            .from(this.state.regionRecordsById.values())
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

    protected createViewState(regionItemRecord: RegionItemRecord, modelState): ViewState<object> {
        return {
            viewFactoryKey: regionItemRecord.viewFactoryMetadata.viewKey,
            stateVersion: regionItemRecord.viewFactoryMetadata.stateVersion,
            state: modelState
        };
    }
}