import * as React from 'react';
import {ConnectableComponent, ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from './connectableComponent';

/**
 * @deprecated
 */
export type ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps = {}> = (view: React.ComponentType) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => React.JSX.Element;

/**
 * @deprecated
 * @param mapModelToProps
 * @param createPublishEventProps
 */
export const connect = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps> {
    return function (view: React.ComponentType) {
        return function (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) {
            const {modelId, viewContext, ...rest} = props;
            return <ConnectableComponent
                modelId={modelId}
                view={view}
                viewContext={viewContext}
                createPublishEventProps={createPublishEventProps}
                mapModelToProps={mapModelToProps}
                {...rest}
            />;
        };
    };
};