import * as React from 'react';
import {useRouter} from './espRouterContext';
import {useMemo} from 'react';
import {Router, utils} from 'esp-js';
import {EspModelContext, useGetModelId} from './espModelContext';
import {createViewForModel} from './viewBindingDecorator';
import {tryGetRenderModel} from './polimer/getEspReactRenderModel';
import {useModelSelector} from './useModelSelector';

/**
 * @deprecated
 */
export type CreatePublishEventProps<TPublishEventProps> = (publishModelEvent: (eventType: string, event: any) => void) => TPublishEventProps;

/**
 * @deprecated
 */
export type MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

/**
 * @deprecated
 */
export interface ConnectableComponentProps<TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentType;
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;
    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

/**
 * @deprecated
 */
export interface ConnectableComponentChildProps<TModel = object> {
    modelId: string;
    model: TModel;
    router: Router;
    [key: string]: any; // ...rest props
}

const getChildProps = <TModel, TModelMappedToProps, TPublishEventProps>(
    router: Router,
    modelId: string,
    restProps: object,
    initialModel: TModel,
    mapModelToProps: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    publishEventProps: TPublishEventProps
): ConnectableComponentChildProps<TModel> => {
    // consume what this component owns, and let the rest end up in `...rest`
    const model = tryGetRenderModel<TModel>(initialModel);
    let childProps = {
        modelId,
        router: router,
        ...restProps,
        ...publishEventProps,
        model
    };
    if (mapModelToProps) {
        childProps = {
            ...childProps,
            ...(mapModelToProps(model, publishEventProps) as TModelMappedToProps)
        };
    }
    return childProps;
};

/**
 * @deprecated - use ViewBinderConnectable and ESP hooks if you need to dynamically bind a view to a model
 * or useModelSelector with other ESP hooks for direct model subscription.
 */
export const ConnectableComponent = <TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}>(
    {
        modelId,
        mapModelToProps,
        createPublishEventProps,
        view,
        viewContext,
        ...rest
    }: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>
) => {
    const router = useRouter();
    modelId = modelId || useGetModelId();
    if (utils.stringIsEmpty(modelId) || !router) {
        return null;
    }
    const publishEventProps: TPublishEventProps = useMemo(
        () => {
            if (createPublishEventProps) {
                const publishModelEvent = (eventType: string, event: any) => {
                    router.publishEvent(modelId, eventType, event);
                };
                return createPublishEventProps(publishModelEvent);
            }
            return {} as TPublishEventProps;
        },
        [router, modelId]
    );
    const model = useModelSelector<TModel, TModel>(
        m => m,
        modelId,
        false
    );
    if (model == null) {
        return null;
    }
    let childProps = getChildProps(router, modelId, rest, model, mapModelToProps, publishEventProps);
    let viewElement = createViewForModel(model, childProps, viewContext, view);
    return (
        <EspModelContext modelId={modelId} model={model} router={router} {...childProps}>
            {viewElement}
        </EspModelContext>
    );
};