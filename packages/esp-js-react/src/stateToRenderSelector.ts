import {EspMetadata, EspDecoratorUtil} from 'esp-js';

export interface StateToRenderSelectorMetadata {
    functionName: string;
}

export namespace StateToRenderSelectorConsts {
    export const CustomDataKey = 'StateToRenderSelectorCustomDataKey';
    /**
     * If there is no @stateToRenderSelector decorator and a function by this name exists on a model, then it will be invoked to get the model/state to render
     */
    export const HandlerFunctionName = 'getEspReactStateToRender';
}

/**
 * A decorator which can be used to identify the state saving function on a component instance (typically a model)
 */
export function stateToRenderSelector() {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addCustomData(
            StateToRenderSelectorConsts.CustomDataKey,
            <StateToRenderSelectorMetadata>{ functionName: name }
        );
        return descriptor;
    };
}