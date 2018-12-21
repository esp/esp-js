import {PreEventProcessor} from 'esp-js';
import {PostEventProcessor} from 'esp-js/src/router/eventProcessors';

export interface StateHandlerModel<TState> {
    getState(): TState;
    preProcess?: PreEventProcessor;
    postProcess?: PostEventProcessor;
}