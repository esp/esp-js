import {EventBus} from '../../src/eventBus/eventBus';

/**
 * Helper to register a model with an empty config (no handlers).
 * Used in tests that need a model registered without any event handlers.
 */
export function registerModel<TModel>(bus: EventBus, modelId: string, model: TModel): void {
    bus.storeBuilder<TModel>(modelId, model).build();
}

/**
 * Helper to build an empty StoreConfig with no handlers, subscriptions, or processors.
 */
export function emptyConfig() {
    return {
        eventHandlers: new Map(),
        previewHandlers: new Map(),
        effectHandlers: new Map(),
        subscriptionFactories: [],
    };
}
