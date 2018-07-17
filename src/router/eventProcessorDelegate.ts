export interface PreEventProcessor {
    (model: any): void;
}

export interface PostEventProcessor {
    (model: any, eventsProcessed: string[]): void;
}
