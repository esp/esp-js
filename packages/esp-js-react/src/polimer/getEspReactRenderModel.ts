import {EspMetadata, EspDecoratorUtil, utils} from 'esp-js';

export interface GetEspReactRenderModelMetadata {
    functionName: string;
}

export namespace GetEspReactRenderModelConsts {
    export const CustomDataKey = 'GetEspReactRenderModelCustomDataKey';
    /**
     * If there is no @getEspReactRenderModel decorator and a function by this name exists on a model, then it will be invoked to identify the sub model which will replaced the `model` prop passed to the child view of a ConnectableComponent
     */
    export const HandlerFunctionName = 'getEspReactRenderModel';
}

/**
 * A decorator which can be used to identify the render model which will replaced the `model` prop passed to the child view of a ConnectableComponent
 */
export function getEspReactRenderModel() {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addCustomData(
            GetEspReactRenderModelConsts.CustomDataKey,
            <GetEspReactRenderModelMetadata>{ functionName: name }
        );
        return descriptor;
    };
}

/**
 * Returns the model which will be used to pluck state/props for the current view.
 *
 * This is basically a hook (not a React 'hook') to call a function on `model` and get a new sub graph to use as state.
 *
 */
export const tryGetRenderModel = <TRenderModel>(model: any): TRenderModel => {
    // does the given model have a decorated function we can invoke to get a different model to render?
    if (EspDecoratorUtil.hasMetadata(model)) {
        let metadata: GetEspReactRenderModelMetadata = EspDecoratorUtil.getCustomData(model, GetEspReactRenderModelConsts.CustomDataKey);
        if (metadata) {
            return model[metadata.functionName]();
        }
    }
    // else see if there is a function with name GetEspReactRenderModelConsts.HandlerFunctionName we can invoke to get a different model to render?
    let renderModelGetter = model[GetEspReactRenderModelConsts.HandlerFunctionName];
    if (renderModelGetter && utils.isFunction(renderModelGetter)) {
        return renderModelGetter.call(model);
    }
    // else return the initial model passed in
    return model;
};