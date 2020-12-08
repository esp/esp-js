import {LoadResult} from './prerequisites';

export enum ModuleChangeType {
    Change = 'Change',
    Error = 'Error'
}

export enum ModuleLoadStage {
    Loading = 1,
    Registered = 2,
    Prerequisites = 3,
    Initialising = 4,
    Loaded = 5,
}

/**
 * An interface which provides information about the load progress of a module.
 */
export interface ModuleLoadResult {
    type: ModuleChangeType;
    moduleKey: string;
    moduleName: string;
    description?: string;
    prerequisiteResult?: LoadResult;
    errorMessage?: string;
    hasCompletedLoaded?: boolean;
    stage: ModuleLoadStage;
}