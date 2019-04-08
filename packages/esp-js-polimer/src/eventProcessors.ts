export interface ModelPreEventProcessor<TModel> {
    (model: TModel): TModel | void;
}

export interface ModelPostEventProcessor<TModel> {
    (model: TModel, eventsProcessed: string[]): TModel | void;
}
