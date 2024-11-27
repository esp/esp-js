import * as React from 'react';
import {useRouter} from '../espRouterContext';
import {useEffect, useState} from 'react';
import {Router, SerialDisposable, utils} from 'esp-js';
import {EspModelContext, PublishModelEventDelegate, useGetModelId} from '../espModelContext';
import {createViewForModel} from '../viewBindingDecorator';
import {getRenderModel} from './connectableComponentCommon';

export type CreatePublishEventProps<TPublishEventProps> = (publishModelEvent: (eventType: string, event: any) => void) => TPublishEventProps;

export type MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

export interface ConnectableComponentProps<TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentType;
    /**
     * Provides means to create a serious of 'publish event' callbacks which will be passed as props to the child view.
     */
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;

    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

interface ConnectableComponentState {
    model?: any;
    currentModelId?: string;
    publishProps?: any;
    publishEvent?: PublishModelEventDelegate;
    modelSubscriptionDisposable: SerialDisposable;
}

interface ConnectableComponentChildProps<TModel> {
    modelId: string;
    model: TModel;
    router: Router;

    [key: string]: any; // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

const getChildProps = <TModel, >(
    router: Router,
    props: ConnectableComponentProps,
    state: ConnectableComponentState
): ConnectableComponentChildProps<TModel> => {
    // consume what this component owns, and let the rest end up in `...rest`
    const {
        children,
        createPublishEventProps,
        modelId,
        mapModelToProps,
        view,
        viewContext,
        ...rest
    } = props;
    const model = getRenderModel(state.model);
    let childProps = {
        modelId,
        router: router,
        ...rest,
        ...state.publishProps,
        model
    };
    if (props.mapModelToProps) {
        childProps = {
            ...childProps,
            ...(props.mapModelToProps(model, state.publishProps) as any)
        };
    }
    return childProps;
};

const createPublishProps = (router: Router, modelId: string, props: ConnectableComponentProps) => {
    if (utils.stringIsEmpty(modelId)) {
        return null;
    }
    if (!props.createPublishEventProps) {
        return null;
    }
    return props.createPublishEventProps(
        (eventType: string, event: any) => router.publishEvent(modelId, eventType, event)
    );
};

export const ConnectableComponent = (props: ConnectableComponentProps) => {
    const router = useRouter();
    const modelId = props.modelId || useGetModelId();
    const [state, setState] = useState<ConnectableComponentState>({
        modelSubscriptionDisposable: new SerialDisposable(),
        currentModelId: '',
        model: null
    });
    if (state.currentModelId !== modelId) {
        setState({
            ...state,
            currentModelId: modelId,
            publishProps: createPublishProps(router, modelId, props)
        });
    }
    useEffect(() => {
        // If this callback is running it means either it's the firs time, or the router/modelId has changed
        // Cancel (or noop) any existing subscription to the model
        state.modelSubscriptionDisposable.setDisposable(null);
        if (utils.stringIsEmpty(modelId)) {
            return;
        }
        state.modelSubscriptionDisposable.setDisposable(router
            .getModelObservable(props.modelId)
            .subscribe((model: any) => {
                setState({
                    ...state,
                    model
                });
            }));
        return () => {
            state.modelSubscriptionDisposable.dispose();
        };
    }, [router, modelId]);
    if (state.model == null) {
        return null;
    }
    let childProps = getChildProps(router, props, state);
    let view = createViewForModel(state.model, childProps, props.viewContext, props.view);
    return (
        <EspModelContext modelId={props.modelId} router={router} {...childProps}>
            {view}
        </EspModelContext>
    );
};