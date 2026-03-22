import {Router} from '../../src/router/router';
import {ModelBuilder} from '../../src/model/modelBuilder';

/**
 * Helper to register a model with an empty config (no handlers).
 * Used in tests that need a model registered without any event handlers.
 */
export function registerModel<TModel>(router: Router, modelId: string, model: TModel): void {
    new ModelBuilder<TModel>(router, modelId, model).registerWithRouter();
}

/**
 * Helper to build an empty ModelConfig with no handlers, subscriptions, or processors.
 */
export function emptyConfig() {
    return {
        eventHandlers: new Map(),
        previewHandlers: new Map(),
        effectHandlers: new Map(),
        subscriptionFactories: [],
    };
}
