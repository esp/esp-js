import * as React from 'react';
import {ConnectableComponentProps, CreatePublishEventProps, MapModelToProps} from './connectableComponent';
import {connectWithSelector} from './connectWithSelector';
import {usePublishModelEvent} from './espModelContext';

// version backing onto connectWithSelector
export const connect2 = function <TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): (view: React.ComponentType) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => JSX.Element {
    return function (view: React.ComponentType) {
        return function (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) {
            const {modelId, viewContext, ...rest} = props;
            const publishEventProps = createPublishEventProps(usePublishModelEvent());
            const mappedProps = connectWithSelector<TModel>(
                modelId,
                model => mapModelToProps(model, publishEventProps)
            );
            return React.createElement(view, {... mappedProps, ...rest});
        };
    };
};