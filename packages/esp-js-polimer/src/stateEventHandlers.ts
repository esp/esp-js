import {EventContext} from 'esp-js';

export type PolimerEventHandler<TState, TEvent, TModel> = (draft: TState, event: TEvent, model: TModel, eventContext: EventContext) => void | TState;

export type PolimerHandlerMap<TState, TModel> = {
    [index: string]: PolimerEventHandler<TState, any, TModel>
};

export const MULTIPLE_EVENTS_DELIMITER = '|$|';

export const multipleEvents = (...events: string[]) => {
    return events.join(MULTIPLE_EVENTS_DELIMITER);
};