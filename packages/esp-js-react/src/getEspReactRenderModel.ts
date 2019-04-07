import {EspMetadata, EspDecoratorUtil} from 'esp-js';

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