export enum ResultStage {
    Starting = 'Starting',
    Completed = 'Completed',
    Error = 'Error'
}

export interface LoadResult {
    stage: ResultStage;
    name: string;
    errorMessage?: string;
}