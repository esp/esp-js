import {EventContext} from '../eventBus/eventContext';
import {Disposable} from '../system/disposables';
import {Draft} from 'immer';

export type PublishDelegate = (eventType: string, event: any) => void;

export type EventHandler<TModel, TEvent = any> = (
    draft: Draft<TModel>,
    event: TEvent,
    eventContext: EventContext
) => void;

/**
 * Runs before the normal stage and can cancel the event via eventContext.cancel().
 * At runtime it receives the live immer draft: treat it as read-only, don't mutate it.
 */
export type PreviewHandler<TModel, TEvent = any> = (
    model: Readonly<TModel>,
    event: TEvent,
    eventContext: EventContext
) => void;

export type EffectHandler<TModel, TEvent = any> = (
    model: Readonly<TModel>,
    event: TEvent,
    eventContext: EventContext,
    publish: PublishDelegate
) => void;

export type SubscriptionFactory = (publish: PublishDelegate) => Disposable;

/**
 * Runs once before each dispatch round. Receives the immer draft, writes are applied to the model.
 */
export type PreEventProcessorFn<TModel> = (draft: Draft<TModel>) => void;

/**
 * Runs once after each dispatch round, e.g. to recompute derived state. Receives the immer draft, writes are applied to the model.
 */
export type PostEventProcessorFn<TModel> = (draft: Draft<TModel>, eventsProcessed: string[]) => void;

export interface StoreConfig<TModel> {
    eventHandlers: Map<string, EventHandler<TModel, any>[]>;
    previewHandlers: Map<string, PreviewHandler<TModel, any>[]>;
    effectHandlers: Map<string, EffectHandler<TModel, any>[]>;
    subscriptionFactories: SubscriptionFactory[];
    preEventProcessor?: PreEventProcessorFn<TModel>;
    postEventProcessor?: PostEventProcessorFn<TModel>;
}
