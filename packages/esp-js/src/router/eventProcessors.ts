import {ObservationStage} from './observationStage';

export interface PreEventProcessor {
    (model: any): void;
}

export interface EventDispatchProcessor {
    (model: any, eventType: string, event: any, observationStage?: ObservationStage): void;
}

export interface PostEventProcessor {
    (model: any, eventsProcessed: string[]): void;
}

export interface EventProcessors {
    /**
     * An optional function which if provided will be called before the router processes any events for this model
     */
    preEventProcessor?: PreEventProcessor;
    /**
     * An optional function which if provided will be called just before a given event is dispatched.
     * Note this is different to the preEventProcessor hook in that there can be multiple events dispatched for the same model between the preEventProcessor and postEventProcessor hooks.
     * This function will be called for each event, and for each ObservationStage of the given event.
     */
    eventDispatchProcessor?: EventDispatchProcessor;
    /**
     * An optional function which if provided will be called just after a given event has finished being dispatched.
     * Note this is different to the preEventProcessor hook in that there can be multiple events dispatched for the same model between the preEventProcessor and postEventProcessor hooks.
     * This function will be called for each event, and for each ObservationStage of the given event.
     */
    eventDispatchedProcessor?: EventDispatchProcessor;
    /**
     * An optional function which if provided will be called after the router processes all events on the model current dispatch loop
     */
    postEventProcessor?: PostEventProcessor;
}