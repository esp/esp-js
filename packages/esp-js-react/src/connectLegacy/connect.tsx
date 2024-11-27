import * as React from 'react';
import {ConnectableComponentFactory, ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from '../connectApi/types';
import {ConnectableComponent} from './connectableComponent';

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