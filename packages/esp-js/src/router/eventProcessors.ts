import {ObservationStage} from './observationStage';

export interface PreEventProcessor {
    (model: any): void;
}

export interface EventDispatchProcessor {
    (model: any, eventType: string, observationStage?: ObservationStage): void;
}

export interface PostEventProcessor {
    (model: any, eventsProcessed: string[]): void;
}
