import {EspMetadata, EspDecoratorUtil, utils} from 'esp-js';

export interface GetEspPolimerImmutableModelMetadata {
    functionName: string;
}

export namespace GetEspPolimerImmutableModelConsts {
    export const CustomDataKey = 'GetEspReactImmutableModelCustomDataKey';
    /**
     * If there is no @getEspPolimerImmutableModel decorator and a function by this name exists on a model, then it will be invoked to identify the sub model which will replaced the `model` prop passed to the child view of a ConnectableComponent
     */
    export const HandlerFunctionName = 'getEspPolimerImmutableModel';
}

/**
 * A decorator which can be used to identify the render model which will replaced the `model` prop passed to the child view of a ConnectableComponent
 */
export function getEspPolimerImmutableModel() {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addCustomData(
            GetEspPolimerImmutableModelConsts.CustomDataKey,
            <GetEspPolimerImmutableModelMetadata>{ functionName: name }
        );
        return descriptor;
    };
}

/**
 * Returns the model which will be used to pluck state/props for the current view.
 *
 * This is basically a hook (not a React 'hook') to call a function on `model` and get a new subgraph to use as state.
 *
 */
export const tryGetPolimerImmutableModel = <TImmutableModel>(model: any): TImmutableModel => {
    // does the given model have a decorated function we can invoke to get a different model to render?
    if (EspDecoratorUtil.hasMetadata(model)) {
        let metadata: GetEspPolimerImmutableModelMetadata = EspDecoratorUtil.getCustomData(model, GetEspPolimerImmutableModelConsts.CustomDataKey);
        if (metadata) {
            return model[metadata.functionName]();
        }
    }
    // else see if there is a function with name GetEspPolimerImmutableModelConsts.HandlerFunctionName we can invoke to get a different model to render?
    let immutableModel = model[GetEspPolimerImmutableModelConsts.HandlerFunctionName];
    if (immutableModel && utils.isFunction(immutableModel)) {
        return immutableModel.call(model);
    }
    // else return the initial model passed in
    return model;
};