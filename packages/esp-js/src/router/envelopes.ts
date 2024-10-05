import {EventContext} from './eventContext';
import {ObservationStage} from './observationStage';

export enum DispatchType {
    'Event',
    'ModelUpdate',
    'ModelDelete'
}

export interface EventEnvelope<TEvent, TModel> {
    /**
     * The event payload
     */
    event: TEvent;
    /**
     * The event type
     */
    eventType: string;
    /**
     * The target model's ID
     */
    modelId: string;
    /**
     * An optional model path that may have been provided when the even was published to the Router
     */
    entityKey: string;
    /**
     * The model for which the event needs to be applied to
     */
    model: TModel;
    /**
     * The stage in the dispatch loop at which the event is currently being dispatched for
     */
    observationStage: ObservationStage;
    /**
     * Additional context about the event
     */
    context: EventContext;
    /**
     * The dispatch type, for EventEnvelope this should always be 'Event'
     */
    dispatchType: DispatchType;
}

export interface ModelEnvelope<TModel> {
    model: TModel;
    modelId: string;
    dispatchType: DispatchType;
}