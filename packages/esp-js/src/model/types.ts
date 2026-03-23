import {EventContext} from '../eventBus/eventContext';
import {Disposable} from '../system/disposables';
import {Draft} from 'immer';

export type PublishDelegate = (eventType: string, event: any) => void;

export type EventHandler<TModel, TEvent = any> = (
    draft: Draft<TModel>,
    event: TEvent,
    eventContext: EventContext
) => void;

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

export type PreEventProcessorFn<TModel> = (model: Readonly<TModel>) => void;

export type PostEventProcessorFn<TModel> = (model: Readonly<TModel>, eventsProcessed: string[]) => void;

export interface ModelConfig<TModel> {
    eventHandlers: Map<string, EventHandler<TModel, any>[]>;
    previewHandlers: Map<string, PreviewHandler<TModel, any>[]>;
    effectHandlers: Map<string, EffectHandler<TModel, any>[]>;
    subscriptionFactories: SubscriptionFactory[];
    preEventProcessor?: PreEventProcessorFn<TModel>;
    postEventProcessor?: PostEventProcessorFn<TModel>;
}
