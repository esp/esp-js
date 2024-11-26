import * as React from 'react';
import {ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from './connectableComponent';
import {ConnectModelToRouterContainer, ConnectModelToRouterContainerChildProps, ConnectModelToRouterContainerProps} from './connectModelToRouterContainer';
import {usePublishModelEvent} from './espModelContext';
import {useCallback, useMemo} from 'react';

/**
 * Wraps the given view in a component that is prop compatible with ConnectModelToRouterContainer
 * @param view
 * @param mapModelToProps
 * @param createPublishEventProps
 */
const createConnectModelToRouterContainerAdapterForView = <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    view: React.ComponentType,
    mapModelToProps: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps: CreatePublishEventProps<TPublishEventProps>,
) => {
    return ({modelId, model}: ConnectModelToRouterContainerChildProps<TModel>) => {
        const publishEventProps = useMemo(
            () => createPublishEventProps(usePublishModelEvent()),
            [modelId]
        );
        const childProps = mapModelToProps(model, publishEventProps);
        return React.createElement(view, childProps);
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
                createConnectModelToRouterContainerAdapterForView(view, mapModelToProps, createPublishEventProps),
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