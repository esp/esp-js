import {useRouter} from '../espRouterContext';
import {EspModelContext} from '../espModelContext';
import {EspDecoratorUtil, Logger, Router, utils} from 'esp-js';
import * as React from 'react';
import {connectWithSelector} from '../connectWithSelector';
import {createViewForModel} from '../viewBindingDecorator';
import {ConnectableComponentLike, ConnectableComponentProps} from '../connectApi/types';
import {GetEspReactRenderModelConsts, GetEspReactRenderModelMetadata} from '../getEspReactRenderModel';
import {getRenderModel} from '../getEspReactRenderModel';

interface ConnectableComponentChildProps {
    modelId: string;
    model: unknown;
    router: Router;
    [key: string]: any;
}

const _log = Logger.create('ConnectableComponent');

export const ConnectableComponent: ConnectableComponentLike = ({modelId, viewContext, view, createPublishEventProps, mapModelToProps, ...rest}: ConnectableComponentProps) => {
    warnIfUsingLegacyProps(createPublishEventProps, mapModelToProps);
    const router = useRouter();
    const model = connectWithSelector<object, object>(
        // ConnectableComponent, which deals with top level esp models, needs to always mutate the model to force connectWithSelector to re-render
        m => Object.create(m),
        modelId
    );
    if (model == null) {
        return null;
    }
    // Modern react doesn't really use older Higher Order Component patters, specifically:
    // * Consume your props, pass everything else down - typically done by extracting '...rest' props and pass them via cloned children.
    // * Pass cross-cutting props through the tree - typically done by massing props via cloned children.
    // However, given this code will work with legacy code, it's going do both.
    // Below, the EspModelContext, will provide a migration path as that exposes data via React context,
    // this will so code can move away from having to pass common props through the tree.
    let renderModel = getRenderModel(model);
    const childProps: ConnectableComponentChildProps = {
        modelId,
        router: router,
        ...rest,
        model: renderModel
    };
    let viewElement = createViewForModel(model, childProps, viewContext, view);
    return (
        <EspModelContext modelId={modelId} router={router} model={renderModel} {...childProps}>
            {viewElement}
        </EspModelContext>
    );
};

/**
 * This function either:
 * 1) for esp-js-polimer models: get the immutable model
 * 2) for esp-js OO models - creates a mutation using Object.create(model).
 *
 * This point 2, is a ConnectableComponent behavior change in ESP 8.
 * It's required as the logic to connect to the ESP router is now behind connectWithSelector(), which ultimately uses https://react.dev/reference/react/useSyncExternalStore.
 * useSyncExternalStore requires state to mutate for a re-render.
 * This shouldn't have any impact on OO models as the view side only reads data from the model, that will be intact.
 *
 * @param model
 */
const ensureModuleMutated = (model: any): unknown => {
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
    // else we mutate the original model as we need a new instance for React to detect a re-render
    let mutated = Object.create(model);
    return mutated;
};

const warnIfUsingLegacyProps = (createPublishEventProps: any, mapModelToProps: any) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (mapModelToProps || createPublishEventProps) {
        let stack: string | undefined = undefined;
        try {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        } catch (e) {
            stack = (e as Error).stack;
        }
        _log.warn(
            `ConnectableComponent (new version) detected legacy props being passed, these will be ignored. ` +
            stack
        );
    }
};