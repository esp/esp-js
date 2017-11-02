import {LoadResult} from './prerequisites/loadResult';

export interface ModuleLoadChange {
    type: 'loadChange';
    moduleName: string;
    description: string;
    prerequisiteResult?: LoadResult;
}

export interface ModuleLoadErrorChange {
    type: 'loadError';
    moduleName: string;
    errorMessage: string;
    prerequisiteResult?: LoadResult;
}

export type ModuleLoadResult = ModuleLoadChange | ModuleLoadErrorChange;