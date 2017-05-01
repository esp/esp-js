interface BaseResult {
    stage: string;
    name: string;
}

export interface StartingResult extends BaseResult {
    stage: 'starting';
}

export interface CompletedResult extends BaseResult {
    stage: 'completed';
}

export interface ErroredResult extends BaseResult {
    stage: 'error';
    errorMessage: string;
}

export type LoadResult = StartingResult | CompletedResult | ErroredResult;
