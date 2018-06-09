import {EventProcessor} from './eventProcessorDelegate';

export interface ModelOptions {
    preEventProcessor?: EventProcessor;
    postEventProcessor?: EventProcessor;
}