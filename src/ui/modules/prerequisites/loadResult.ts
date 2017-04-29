export interface StartingLoadResult {
    stage: 'starting';
    name: string;
}

export interface CompletedLoadResult {
    stage: 'completed';
    name: string;
}

export interface ErroredLoadResult {
    stage: 'error';
    name: string;
    errorMessage: string;
}

export type LoadResult = StartingLoadResult | CompletedLoadResult | ErroredLoadResult;
