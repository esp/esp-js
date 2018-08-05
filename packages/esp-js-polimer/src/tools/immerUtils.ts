import produce from 'immer';
import {PolimerHandlerMap} from '../polimerState';

/**
 * This types represent enhanced handlers by produce from immer
 */
type FunctionProducerHandler<TState, TEvent, TStore> = (currentState: TState, event: TEvent, store: TStore) => TState;
type ComposedProducerHandler<TState, TEvent, TStore> = {
    success?: FunctionProducerHandler<TState, TEvent, TStore>;
    error?: FunctionProducerHandler<TState, TEvent, TStore>;
};

export type ProducerMap<TState, TEvent, TStore> = {
    [index: string]: ComposedProducerHandler<TState, TEvent, TStore> | FunctionProducerHandler<TState, TEvent, TStore>
};

export const applyImmer = <TState, TStore>(map: PolimerHandlerMap<TState, TStore>): ProducerMap<TState, any, TStore> => {
    return Object.keys(map)
        .reduce((aggregator, handlerKey) => {
            const handler = map[handlerKey];

            if (typeof handler === 'function') {
                aggregator[handlerKey] = produce(handler);
            } else if (typeof handler === 'object') {
                // This means it's a synthetic handler that has success and error fork
                aggregator[handlerKey] = {
                    success: handler.success && produce(handler.success),
                    error: handler.error && produce(handler.error)
                };
            }

            return aggregator;
        }, {});
};
