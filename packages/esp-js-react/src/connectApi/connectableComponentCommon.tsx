import {EspDecoratorUtil, utils} from 'esp-js';
import {GetEspReactRenderModelConsts, GetEspReactRenderModelMetadata} from '../getEspReactRenderModel';

/**
 * Returns the model which will be used to pluck state/props for the current view.
 *
 * This is basically a hock (not a react 'hook') to call a function on `model` and get a new sub graph to use as state.
 */
export const getRenderModel = (model: any): unknown => {
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