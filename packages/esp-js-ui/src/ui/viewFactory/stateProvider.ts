import {EspMetadata, EspDecoratorUtil, utils} from 'esp-js';

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

export namespace StateUtils {
    export const tryGetState = (model: any) => {
        let viewState = null;
        // try see if there was a @stateProvider decorator on the views model,
        // if so invoke the function it was declared on to get the state.
        if (EspDecoratorUtil.hasMetadata(model)) {
            const metadata: StateSaveProviderMetadata = EspDecoratorUtil.getCustomData(model, StateSaveProviderConsts.CustomDataKey);
            if (metadata) {
                viewState = model[metadata.functionName]();
            }
        }
        if (!viewState) {
            // else see if there is a function with name StateSaveProviderConsts.HandlerFunctionName
            const stateProviderFunction = model[StateSaveProviderConsts.HandlerFunctionName];
            if (stateProviderFunction && utils.isFunction(stateProviderFunction)) {
                viewState = stateProviderFunction.call(model);
            }
        }
        return viewState;
    };
}