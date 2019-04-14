import {EspMetadata, EspDecoratorUtil} from 'esp-js';

export interface StateSaveProviderMetadata {
    functionName: string;
}

export namespace StateSaveProviderConsts {
    export const CustomDataKey = 'StateSaveProviderCustomDataKey';
    /**
     * If there is no @stateProvider decorator and a function by this name exists on a model, then it will be invoked to get state
     */
    export const HandlerFunctionName = 'getEspUiModelState';
}

/**
 * A decorator which can be used to identify the state saving function on a view's model
 */
export function stateProvider() {
    return function (target, name, descriptor) {
        let metadata: EspMetadata  = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addCustomData(
            StateSaveProviderConsts.CustomDataKey,
            <StateSaveProviderMetadata>{ functionName: name }
        );
        return descriptor;
    };
}