import {EspMetadata, EspDecoratorUtil} from 'esp-js';

export interface StateSaveHandlerMetadata {
    functionName: string;
}

export namespace StateSaveHandlerConsts {
    export const CustomDataKey = 'StateSaveHandlerCustomDataKey';
    /**
     * If there is no @stateSaveHandler decorator and a function by this name exists on a model, then it will be invoked to get state
     */
    export const HandlerFunctionName = 'getEspUiComponentState';
}

/**
 * A decorator which can be used to identify the state saving function on a component instance (typically a model)
 */
export function stateSaveHandler() {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addCustomData(
            StateSaveHandlerConsts.CustomDataKey,
            <StateSaveHandlerMetadata>{ functionName: name }
        );
        return descriptor;
    };
}