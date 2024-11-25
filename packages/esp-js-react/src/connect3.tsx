import * as React from 'react';
import {ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from './connectableComponent';
import {ConnectModelToRouterContainer} from './connectModelToRouterContainer';
import {usePublishModelEvent} from './espModelContext';
import {useCallback, useMemo} from 'react';

const createConnectModelToRouterContainerAdapter = <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    view: React.ComponentType,
    mapModelToProps: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps: CreatePublishEventProps<TPublishEventProps>,
) => {
    return ({model, modelId, ...rest}: { model: TModel, modelId: string, [key: string]: any }) => {
        const publishEventProps = useMemo(
            () => createPublishEventProps(usePublishModelEvent()),
            [modelId]
        );
        const childProps = mapModelToProps(model, publishEventProps);
        return React.createElement(view, {...childProps, ...rest});
    };
};

// version backing onto connectModelToRouterContainer
export const connect3 = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): (view: React.ComponentType) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => JSX.Element {
    return (view: React.ComponentType) => {
        return (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => {
            const {modelId, viewContext, ...rest} = props;
            const routerContainerAdapter = useCallback(
                createConnectModelToRouterContainerAdapter(view, mapModelToProps, createPublishEventProps),
                [modelId]
            );
            return React.createElement(
                ConnectModelToRouterContainer,
                {modelId, ...rest},
                React.createElement(routerContainerAdapter)
            );
        };
    };
};