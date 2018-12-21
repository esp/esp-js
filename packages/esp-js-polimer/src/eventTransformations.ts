import * as Rx from 'rx';
import {EspDecoratorUtil, Guard, EspMetadata, ObservationStage, DecoratorTypes, EventContext} from 'esp-js';

/**
 * A decorator which can be used to declare an event transformation handler
 */
export function eventTransformFor(eventType: string) {
    return function (target, name, descriptor) {
        Guard.stringIsNotEmpty(eventType, 'eventType passed to an observeStoreEvent decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType,
            DecoratorTypes.custom,
            null,
            null
        );
        return descriptor;
    };
}

export interface InputEvent<TStore, TEvent> {
    readonly event: TEvent;
    readonly store: TStore;
    readonly eventType: string;
    readonly context: EventContext;
}

export type InputEventStream<TStore, TEvent> = Rx.Observable<InputEvent<TStore, TEvent>>;

export type InputEventStreamFactory<TStore, TEvent = any> = (eventType: string | string[], observationStage?: ObservationStage) => InputEventStream<TStore, TEvent>;

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

export type OutputEventStream<TEvent> = Rx.Observable<OutputEvent<TEvent>>;

export type OutputEventStreamFactory<TStore, TInputEvent, TOutputEvent>  = (getEventStreamFor: InputEventStreamFactory<TStore, TInputEvent>) => OutputEventStream<TOutputEvent>;