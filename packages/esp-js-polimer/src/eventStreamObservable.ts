import * as Rx from 'rx';
import {EventContext, ObservationStage} from 'esp-js';

export interface InputEvent<TEvent, TStore> {
    readonly event: TEvent;
    readonly store: TStore;
    readonly eventType: string;
    readonly context: EventContext;
}

export type InputEventStreamFactory<TStore, TEvent = any> = (eventType: string | string[], observationStage?: ObservationStage) => Rx.Observable<InputEvent<TStore, TEvent>>;

export type OutputEvent<TEvent> = {
    readonly eventType: string;
    /**
     * The modelId to publish the event to, if omitted the model for the current store will be used.
     */
    readonly modelId?: string;
    readonly event?: TEvent;
    /**
     * If true, the resultant event will be broadcast to all models.
     *
     * Don't overuse this, if you really have state for all models you want to broadcast then great, but if you have specific state for a specific model use that models ID.
     *
     * Broadcast will enqueue the event onto each models event queue regardless of weather they are subscribed to it or not.
     */
    readonly broadcast?: boolean
};

export type OutputEventStreamFactory<TStore, TInputEvent, TOutputEvent>  = (getEventStreamFor: InputEventStreamFactory<TStore, TInputEvent>) => Rx.Observable<OutputEvent<TOutputEvent>>;