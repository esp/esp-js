import {EventContext} from 'esp-js';

export type PolimerEventHandler<TState, TEvent, TModel> = (draft: TState, event: TEvent, model: TModel, eventContext: EventContext) => void | TState;