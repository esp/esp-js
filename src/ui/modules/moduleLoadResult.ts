import {LoadResult} from './prerequisites/loadResult';

export enum ModuleChangeType {
    Change = 'Change',
    Error = 'Error'
}

export interface ModuleLoadResult {
    type: ModuleChangeType;
    moduleName: string;
    description?: string;
    prerequisiteResult?: LoadResult;
    errorMessage?: string;
}