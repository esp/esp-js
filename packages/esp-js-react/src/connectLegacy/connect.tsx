import * as React from 'react';
import {ConnectableComponent, ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from './connectableComponent';

export const connect = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): (view: React.ComponentType) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => JSX.Element {
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