import {
    ModelConfig,
    EventHandler,
    PreviewHandler,
    EffectHandler,
    SubscriptionFactory,
    PreEventProcessorFn,
    PostEventProcessorFn,
} from './types';
import {Guard} from '../system/guard';

export class ModelBuilder<TModel> {
    private _eventHandlers: Map<string, EventHandler<TModel, any>[]> = new Map();
    private _previewHandlers: Map<string, PreviewHandler<TModel, any>[]> = new Map();
    private _effectHandlers: Map<string, EffectHandler<TModel, any>[]> = new Map();
    private _subscriptionFactories: SubscriptionFactory[] = [];
    private _preEventProcessor: PreEventProcessorFn<TModel> = null;
    private _postEventProcessor: PostEventProcessorFn<TModel> = null;

    private constructor(
        private _addModelFn: (modelId: string, initialModel: TModel, config: ModelConfig<TModel>) => void,
        private _modelId: string,
        private _initialModel: TModel
    ) {
        Guard.isDefined(_addModelFn, 'addModelFn must be defined');
        Guard.isString(_modelId, 'modelId must be a string');
        Guard.isDefined(_initialModel, 'initialModel must be defined');
    }

    /** @internal */
    static _create<TModel>(
        addModelFn: (modelId: string, initialModel: TModel, config: ModelConfig<TModel>) => void,
        modelId: string,
        initialModel: TModel
    ): ModelBuilder<TModel> {
        return new ModelBuilder(addModelFn, modelId, initialModel);
    }

    withEventHandler<TEvent>(eventType: string, handler: EventHandler<TModel, TEvent>): this {
        Guard.isString(eventType, 'eventType must be a string');
        Guard.isDefined(handler, 'handler must be defined');
        if (!this._eventHandlers.has(eventType)) {
            this._eventHandlers.set(eventType, []);
        }
        this._eventHandlers.get(eventType).push(handler);
        return this;
    }

    withPreviewHandler<TEvent>(eventType: string, handler: PreviewHandler<TModel, TEvent>): this {
        Guard.isString(eventType, 'eventType must be a string');
        Guard.isDefined(handler, 'handler must be defined');
        if (!this._previewHandlers.has(eventType)) {
            this._previewHandlers.set(eventType, []);
        }
        this._previewHandlers.get(eventType).push(handler);
        return this;
    }

    withEffect<TEvent>(eventType: string, handler: EffectHandler<TModel, TEvent>): this {
        Guard.isString(eventType, 'eventType must be a string');
        Guard.isDefined(handler, 'handler must be defined');
        if (!this._effectHandlers.has(eventType)) {
            this._effectHandlers.set(eventType, []);
        }
        this._effectHandlers.get(eventType).push(handler);
        return this;
    }

    withEventSubscription(factory: SubscriptionFactory): this {
        Guard.isDefined(factory, 'subscription factory must be defined');
        this._subscriptionFactories.push(factory);
        return this;
    }

    withPreEventProcessor(processor: PreEventProcessorFn<TModel>): this {
        Guard.isDefined(processor, 'preEventProcessor must be defined');
        this._preEventProcessor = processor;
        return this;
    }

    withPostEventProcessor(processor: PostEventProcessorFn<TModel>): this {
        Guard.isDefined(processor, 'postEventProcessor must be defined');
        this._postEventProcessor = processor;
        return this;
    }

    build(): void {
        const config: ModelConfig<TModel> = {
            eventHandlers: this._eventHandlers,
            previewHandlers: this._previewHandlers,
            effectHandlers: this._effectHandlers,
            subscriptionFactories: this._subscriptionFactories,
            preEventProcessor: this._preEventProcessor,
            postEventProcessor: this._postEventProcessor,
        };
        this._addModelFn(this._modelId, this._initialModel, config);
    }
}
