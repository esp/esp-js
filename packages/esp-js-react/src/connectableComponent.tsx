import * as React from 'react';
import {useRouter} from './espRouterContext';
import {useEffect, useMemo, useState} from 'react';
import {Router, SerialDisposable, utils} from 'esp-js';
import {EspModelContext, PublishModelEventDelegate, useGetModelId} from './espModelContext';
import {createViewForModel} from './viewBindingDecorator';
import {tryGetRenderModel} from './getEspReactRenderModel';

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

interface ConnectableComponentState<TModel> {
    model?: TModel;
    publishEvent?: PublishModelEventDelegate;
    modelSubscriptionDisposable: SerialDisposable;
}

const getChildProps = <TModel, TModelMappedToProps, TPublishEventProps>(
    router: Router,
    modelId: string,
    restProps: object,
    state: ConnectableComponentState<TModel>,
    mapModelToProps: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    publishEventProps: TPublishEventProps
): ConnectableComponentChildProps<TModel> => {
    // consume what this component owns, and let the rest end up in `...rest`
    const model = tryGetRenderModel<TModel>(state.model);
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
 * @deprecated
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
    const [state, setState] = useState<ConnectableComponentState<TModel>>({
        modelSubscriptionDisposable: new SerialDisposable(),
        model: null
    });
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
    useEffect(() => {
        state.modelSubscriptionDisposable.setDisposable(router
            .getModelObservable(modelId)
            .subscribe((model: any) => {
                setState({
                    ...state,
                    model
                });
            })
        );
        return () => {
            state.modelSubscriptionDisposable.dispose();
        };
    }, [router, modelId]);
    if (state.model == null) {
        return null;
    }
    let childProps = getChildProps(router, modelId, rest, state, mapModelToProps, publishEventProps);
    let viewElement = createViewForModel(state.model, childProps, viewContext, view);
    return (
        <EspModelContext modelId={modelId} model={state.model} router={router} {...childProps}>
            {viewElement}
        </EspModelContext>
    );
};