import {PostEventProcessor, PreEventProcessor} from './eventProcessorDelegate';

export interface ModelOptions {
    preEventProcessor?: PreEventProcessor;
    postEventProcessor?: PostEventProcessor;
}