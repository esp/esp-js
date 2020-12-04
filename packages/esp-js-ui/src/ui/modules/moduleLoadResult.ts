import {LoadResult} from './prerequisites';

export enum ModuleChangeType {
    Change = 'Change',
    Error = 'Error'
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
}