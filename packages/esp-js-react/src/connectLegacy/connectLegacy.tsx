import * as React from 'react';
import {ConnectableComponentFactory, ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from '../connectApi/types';
import {ConnectableComponentLegacy} from './connectableComponentLegacy';

export const connectLegacy = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps> {
    return function (view: React.ComponentType) {
        return function (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) {
            const {modelId, viewContext, ...rest} = props;
            return <ConnectableComponentLegacy
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