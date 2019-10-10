import * as Rx from 'rx';
import {EspDecoratorUtil, Guard, EspMetadata, ObservationStage, DecoratorTypes, EventContext} from 'esp-js';

/**
 * A decorator which can be used to declare an event transformation handler
 */
export function eventTransformFor(eventType: string, observationStage = ObservationStage.final) {
    return function (target, name, descriptor) {
        Guard.stringIsNotEmpty(eventType, 'eventType passed to an eventTransformFor decorator must not be \'\'');
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType,
            DecoratorTypes.custom,
            observationStage,
            null
        );
        return descriptor;
    };
}

export interface InputEvent<TModel, TEvent> {
    readonly event: TEvent;
    readonly model: TModel;
    readonly eventType: string;
    readonly context: EventContext;
}

export type InputEventStream<TModel, TEvent> = Rx.Observable<InputEvent<TModel, TEvent>>;

export type InputEventStreamFactory<TModel, TEvent = any> = (eventType: string | string[], observationStage?: ObservationStage) => InputEventStream<TModel, TEvent>;

export type OutputEvent<TEvent> = {
    readonly eventType: string;
    /**
     * The modelId to publish the event to, if omitted the current model's id will be used.
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

export type OutputEventStreamFactory<TModel, TInputEvent, TOutputEvent>  = (getEventStreamFor: InputEventStreamFactory<TModel, TInputEvent>) => OutputEventStream<TOutputEvent>;