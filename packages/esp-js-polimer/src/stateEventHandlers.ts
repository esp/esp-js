import {EventContext} from 'esp-js';
import {EventEnvelopePredicate} from './eventEnvelopePredicate';

export type PolimerEventHandler<TState, TEvent, TModel> = (draft: TState, event: TEvent, model: TModel, eventContext: EventContext) => void | TState;

export interface StateHandlerConfiguration {
    /**
     * A handler object containing @observeEvent decorated and side effect free functions
     */
    stateHandler: object;
    /**
     * An optional predicate which will be queried to see if the event applies to the handler.
     */
    deliveryPredicate: EventEnvelopePredicate;
}