import {EventEnvelope} from 'esp-js';

export type EventEnvelopePredicate<TModel = unknown, TEvent = unknown> = (e: EventEnvelope<TEvent, TModel>) => boolean;