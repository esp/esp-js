import * as React from 'react';
import {useEventBus} from './espEventBusContextProvider';
import {useMemo} from 'react';
import {EventBus} from 'esp-js';
import {EspModelContextProvider, useGetModelId} from './espModelContextProvider';
import {syncModelWithSelectorOptions, useSyncModelWithSelector} from './useSyncModelWithSelector';

export type CreatePublishEventProps<TPublishEventProps> = (publishModelEvent: (eventType: string, event: any) => void) => TPublishEventProps;

export type MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

export interface ConnectableComponentProps<TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    view?: React.ComponentType;
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;
    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export interface ConnectableComponentChildProps<TModel = object> {
    modelId: string;
    model: TModel;
    bus: EventBus;
    [key: string]: any; // ...rest props
}

const getChildProps = <TModel, TModelMappedToProps, TPublishEventProps>(
    bus: EventBus,
    modelId: string,
    restProps: object,
    model: TModel,
    mapModelToProps: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    publishEventProps: TPublishEventProps
): ConnectableComponentChildProps<TModel> => {
    let childProps = {
        modelId,
        bus: bus,
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

export const ConnectableComponent = <TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}>(
    {
        modelId,
        mapModelToProps,
        createPublishEventProps,
        view,
        ...rest
    }: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>
) => {
    const bus = useEventBus();
    // Note: we always need to render the hooks else react will complain about a different count.
    let modelIdFromContext = useGetModelId();
    modelId = modelId || modelIdFromContext;
    const publishEventProps: TPublishEventProps = useMemo(
        () => {
            if (createPublishEventProps) {
                const publishModelEvent = (eventType: string, event: any) => {
                    bus.publishEvent(modelId, eventType, event);
                };
                return createPublishEventProps(publishModelEvent);
            }
            return {} as TPublishEventProps;
        },
        [bus, modelId]
    );
    const model = useSyncModelWithSelector<TModel, TModel>(
        m => m,
        syncModelWithSelectorOptions()
            .setModelId(modelId)
    );
    if (model == null) {
        return null;
    }
    let childProps = getChildProps(bus, modelId, rest, model, mapModelToProps, publishEventProps);
    let viewElement = view ? React.createElement(view as React.ComponentType<any>, childProps) : null;
    return (
        <EspModelContextProvider modelId={modelId} model={model} bus={bus} {...childProps}>
            {viewElement}
        </EspModelContextProvider>
    );
};