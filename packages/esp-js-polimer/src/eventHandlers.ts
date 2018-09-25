import {ProducerMap} from './immerUtils';
import {Store} from './store';
import {errorLogger, logger} from './logger';

export const MULTIPLE_EVENTS_DELIMITER = '|$|';

export type PolimerEventHandler<TState, TStore> = (eventType: string, event: any, store: TStore) => void;

export type FunctionPolimerHandler<TState, TEvent, TStore> = (draft: TState, event: TEvent, store: TStore) => void | TState;

export type CompositePolimerHandler<TState, TEvent, TStore> = {
    success?: FunctionPolimerHandler<TState, TEvent, TStore>;
    error?: FunctionPolimerHandler<TState, TEvent, TStore>;
};

export type PolimerHandlerMap<TState, TStore> = {
    [index: string]: CompositePolimerHandler<TState, any, TStore> | FunctionPolimerHandler<TState, any, TStore>
};

export const multipleEvents = (...events: string[]) => {
    return events.join(MULTIPLE_EVENTS_DELIMITER);
};

export const eventHandlerFactory = <TStore extends Store, TState>(
    producerMap: ProducerMap<TState, any, TStore>,
    stateName: string
): PolimerEventHandler<TState, TStore> => {
    return (eventType: string, event: any, store: TStore): void => {
        const beforeState = store[stateName];

        logger.debug(`Received "${eventType}" for "${stateName}" state, about to invoke a reducer. State before execution:`,
            beforeState);

        try {
            let afterState;

            const handler = producerMap[eventType];
            const hasError = event.error != null;

            if (handler == null) {
                throw new Error(`Handler registered to listen on ${eventType} but can't find actual handler for it.`);
            }

            if (typeof handler === 'function') {
                if (hasError) {
                    logger.info(`Received ${eventType} with error=${event.error}, but the handler is a simple function. Ignoring error handler`);
                }

                afterState = handler(beforeState, event, store);
            } else if (typeof handler === 'object') {
                if (hasError && handler.error == null) {
                    return;
                }

                if (!hasError && handler.success == null) {
                    return;
                }

                afterState = hasError
                    ? handler.error(beforeState, event, store)
                    : handler.success(beforeState, event, store);
            }

            store[stateName] = afterState;
            logger.debug(`"${stateName}" state updated successfully, new state:`, afterState);
        } catch (e) {
            // TODO: Add an exception handler, so that developers can react to errors in reducers
            errorLogger.error(`Reducer "${stateName}" threw an exception for event "${eventType}"`, e);
        }
    };
};