import * as React from 'react';
import {useEventBus} from './espEventBusContextProvider';
import {useMemo} from 'react';
import {EventBus} from 'esp-js';
import {EspStoreContextProvider, useGetStoreId} from './espStoreContextProvider';
import {syncStoreModelWithSelectorOptions, useSyncStoreModelWithSelector} from './useSyncStoreModelWithSelector';

export type CreatePublishEventProps<TPublishEventProps> = (publishModelEvent: (eventType: string, event: any) => void) => TPublishEventProps;

export type MapStoreModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

export interface ConnectableComponentProps<TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    storeId?: string;
    view?: React.ComponentType<any>;
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapStoreModelToProps?: MapStoreModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;
    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export interface ConnectableComponentChildProps<TModel = object> {
    storeId: string;
    model: TModel;
    bus: EventBus;
    [key: string]: any; // ...rest props
}

const getChildProps = <TModel, TModelMappedToProps, TPublishEventProps>(
    bus: EventBus,
    storeId: string,
    restProps: object,
    model: TModel,
    mapStoreModelToProps: MapStoreModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    publishEventProps: TPublishEventProps
): ConnectableComponentChildProps<TModel> => {
    let childProps = {
        storeId,
        bus: bus,
        ...restProps,
        ...publishEventProps,
        model
    };
    if (mapStoreModelToProps) {
        childProps = {
            ...childProps,
            ...(mapStoreModelToProps(model, publishEventProps) as TModelMappedToProps)
        };
    }
    return childProps;
};

export const ConnectableComponent = <TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}>(
    {
        storeId,
        mapStoreModelToProps,
        createPublishEventProps,
        view,
        ...rest
    }: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>
) => {
    const bus = useEventBus();
    // Note: we always need to render the hooks else react will complain about a different count.
    let storeIdFromContext = useGetStoreId();
    storeId = storeId || storeIdFromContext;
    // createPublishEventProps is captured once per bus/storeId (not re-run when the prop changes),
    // so callers can pass an inline function and still get stable publish props.
    const publishEventProps: TPublishEventProps = useMemo(
        () => {
            if (createPublishEventProps) {
                const publishModelEvent = (eventType: string, event: any) => {
                    bus.publishEvent(storeId, eventType, event);
                };
                return createPublishEventProps(publishModelEvent);
            }
            return {} as TPublishEventProps;
        },
        [bus, storeId]
    );
    const model = useSyncStoreModelWithSelector<TModel, TModel>(
        m => m,
        syncStoreModelWithSelectorOptions()
            .setStoreId(storeId)
    );
    if (model == null) {
        return null;
    }
    let childProps = getChildProps(bus, storeId, rest, model, mapStoreModelToProps, publishEventProps);
    let viewElement = view ? React.createElement(view, childProps) : null;
    return (
        <EspStoreContextProvider storeId={storeId} model={model} bus={bus} {...childProps}>
            {viewElement}
        </EspStoreContextProvider>
    );
};
