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
     * The target store's ID
     */
    storeId: string;
    /**
     * An optional store path that may have been provided when the event was published to the EventBus
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
    storeId: string;
    dispatchType: DispatchType;
}