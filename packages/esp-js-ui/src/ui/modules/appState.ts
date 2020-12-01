import {RegionState} from '../regions/models';

export interface AppState {
    regionState: RegionState[];
}

export interface AppDefaultStateProvider {
    getDefaultAppState(): AppState;
}