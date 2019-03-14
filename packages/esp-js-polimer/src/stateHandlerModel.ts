import {PreEventProcessor, PostEventProcessor, EspMetadata, EspDecoratorUtil} from 'esp-js';

/**
 * An OO style model which can exists on a polimer store.
 *
 * This is provided so existing OO models can interop with stores.
 */
export interface StateHandlerModel<TState> {
    getEspPolimerState(): TState;
    preProcess?: PreEventProcessor;
    postProcess?: PostEventProcessor;
}