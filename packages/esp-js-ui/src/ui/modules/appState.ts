import {RegionState} from '../regions/models';

/**
 * Represents all state for an application.
 *
 * Given all views are displayed in Regions, the state is therefore modeled around the regions.
 */
export interface AppState {
    regionState: RegionState<any>[];
}

/**
 * Provides a users state for the first time they load the application.
 */
export interface AppDefaultStateProvider {
    getDefaultAppState(): AppState;
}

/**
 * A 'no op' sate provider.
 */
export const NoopAppDefaultStateProvider: AppDefaultStateProvider = {
    getDefaultAppState(): AppState {
        return {
            regionState: []
        };
    }
};