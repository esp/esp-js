import {EventContext} from './eventContext';
import {ObservationStage} from './observationStage';

export enum DispatchType {
    'Event',
    'ModelUpdate',
    'ModelDelete'
}

export interface EventEnvelope<TEvent, TModel> {
    event: TEvent;
    eventType: string;
    modelId: string;
    model: TModel;
    observationStage: ObservationStage;
    context: EventContext;
    dispatchType: DispatchType;
}

export interface ModelEnvelope<TModel> {
    model: TModel;
    modelId: string;
    dispatchType: DispatchType;
}