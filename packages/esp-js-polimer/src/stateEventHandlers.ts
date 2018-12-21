import {EventContext} from 'esp-js';

export type PolimerEventHandler<TState, TEvent, TStore> = (draft: TState, event: TEvent, store: TStore, eventContext: EventContext) => void | TState;

export type PolimerHandlerMap<TState, TStore> = {
    [index: string]: PolimerEventHandler<TState, any, TStore>
};

export const MULTIPLE_EVENTS_DELIMITER = '|$|';

export const multipleEvents = (...events: string[]) => {
    return events.join(MULTIPLE_EVENTS_DELIMITER);
};