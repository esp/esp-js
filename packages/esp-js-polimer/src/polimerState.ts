import {applyImmer, ProducerMap} from './tools/immerUtils';
import {PolimerStore, PolimerStoreContext} from './storeContext';
import {errorLogger, logger} from './tools/logger';

export type PolimerEventHandler<TState> = (eventName: string, event: any) => void;
export type PolimerStateFactory<TState, TStore> = <TKey extends keyof TStore>(storeContext: PolimerStoreContext<TStore>, stateName: TKey) => TState;

const MULTIPLE_EVENTS_DELIMITER = '|$|';

/**
 * Handler for a particular event, invoked by Polimer.
 */
type FunctionPolimerHandler<TState, TEvent, TStore> = (draft: TState, event: TEvent, store: TStore) => void | TState;
type CompositePolimerHandler<TState, TEvent, TStore> = {
    success?: FunctionPolimerHandler<TState, TEvent, TStore>;
    error?: FunctionPolimerHandler<TState, TEvent, TStore>;
};

export type PolimerHandlerMap<TState, TStore> = {
    [index: string]: CompositePolimerHandler<TState, any, TStore> | FunctionPolimerHandler<TState, any, TStore>
};

export const createPolimerState = <TStore, TState>(
    handlerMap: PolimerHandlerMap<TState, TStore>,
    initialState: TState): PolimerStateFactory<TState, TStore> => {

    return <TKey extends keyof TStore>(storeContext: PolimerStoreContext<TStore>, stateName: TKey) => {
        const normalizedHandlerMap = normalizeHandlerMap(handlerMap);
        const immerHandlerMap = applyImmer(normalizedHandlerMap);
        const polimerEventHandler = eventHandlerFactory(immerHandlerMap, storeContext, stateName);
        const events = Object.keys(normalizedHandlerMap);

        logger.debug(`Creating polimer state "${stateName}" listening on the following events:`, events);

        storeContext.addMapping(polimerEventHandler, events);

        return initialState;
    };
};

export const multipleEvents = (...events: string[]) => {
    return events.join(MULTIPLE_EVENTS_DELIMITER);
};

const eventHandlerFactory = <TStore extends PolimerStore, TState, TKey extends keyof TStore>(
    producerMap: ProducerMap<TState, any, TStore>,
    storeContext: PolimerStoreContext<TStore>,
    stateName: TKey
): PolimerEventHandler<TState> => (eventName: string, event: any): void => {

    const store = storeContext.getStore();
    const beforeState = store[stateName];

    logger.debug(`Received "${eventName}" for "${stateName}" state, about to invoke a reducer. State before execution:`,
        beforeState);

    try {
        let afterState;

        const handler = producerMap[eventName];
        const hasError = event.error != null;

        if (handler == null) {
            throw new Error(`Handler registered to listen on ${eventName} but can't find actual handler for it.`);
        }

        if (typeof handler === 'function') {
            if (hasError) {
                logger.info(`Received ${eventName} with error=${event.error}, but the handler is a simple function. Ignoring error handler`);
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
        errorLogger.error(`Reducer "${stateName}" threw an exception for event "${eventName}"`, e);
    }
};

/**
 * This method takes handlerMap and normalizes it producing a new handlerMap.
 * Process of normalizing includes:
 *   - split handler that listens on handler of events to two different handlers
 *
 * @param {PolimerHandlerMap<TState, TStore>} handlerMap
 * @returns {PolimerHandlerMap<TState, TStore>}
 */
const normalizeHandlerMap = <TStore, TState>(handlerMap: PolimerHandlerMap<TState, TStore>): PolimerHandlerMap<TState, TStore> => {
    return Object.keys(handlerMap).reduce((map, eventName) => {
        if (eventName.indexOf(MULTIPLE_EVENTS_DELIMITER) !== -1) {
            const events = eventName.split(MULTIPLE_EVENTS_DELIMITER);
            events.forEach(event => {
                map[event] = handlerMap[eventName];
            });
        } else {
            map[eventName] = handlerMap[eventName];
        }

        return map;
    }, {});
};
