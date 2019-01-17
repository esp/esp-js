import {PolimerStoreBuilder, PolimerModel} from 'esp-js-polimer';
import {DEFAULT_VIEW_KEY, viewBinding} from '../viewBindingDecorator';

declare module 'esp-js-polimer/.dist/typings/storeBuilder' {
    export interface PolimerStoreBuilder<TStore> {
        withViewBindings?(view: any, displayContext?: string): PolimerStoreBuilder<TStore>;
    }
}

interface ViewMappings {
    [displayContext: string]: any;
}

PolimerStoreBuilder.prototype.withViewBindings = function (view: any, displayContext: string = DEFAULT_VIEW_KEY): PolimerStoreBuilder<any> {
    let builder = this;
    // store some metadata on the builder which we'll use later to tack onto the model
    let viewMappings: ViewMappings = builder._viewMappings || { };
    viewMappings[displayContext] = view;
    builder._viewMappings = viewMappings;
    return this;
};

// we need to replace the registerWithRouter in order to dynamically add the
// @viewBinding decorator to it
let registerWithRouter = PolimerStoreBuilder.prototype.registerWithRouter;
PolimerStoreBuilder.prototype.registerWithRouter = function (): PolimerModel<any> {
    let builder = this;
    let model = registerWithRouter.call(builder);
    let viewMappings: ViewMappings = builder._viewMappings;
    if (viewMappings) {
        Object.keys(viewMappings).forEach(displayContext => {
            viewBinding(viewMappings[displayContext], displayContext)(model.constructor);
        });
    }
    return model;
};
