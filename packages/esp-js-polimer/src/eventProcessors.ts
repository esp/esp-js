export interface StorePreEventProcessor<TStore> {
    (store: TStore): TStore | void;
}

export interface StorePostEventProcessor<TStore> {
    (store: TStore, eventsProcessed: string[]): TStore | void;
}
