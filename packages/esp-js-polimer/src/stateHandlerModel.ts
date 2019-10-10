import {PreEventProcessor, PostEventProcessor} from 'esp-js';

/**
 * An OO style model which can exists on a polimer model.
 *
 * This is provided so existing OO models can interop with immutable models.
 */
export interface StateHandlerModel<TState> {
    getEspPolimerState(): TState;
    preProcess?: PreEventProcessor;
    postProcess?: PostEventProcessor;
}