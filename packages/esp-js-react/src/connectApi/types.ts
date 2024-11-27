import * as React from 'react';

export type ConnectEqualityFn<T> = (last: T, next: T) => boolean;

export type CreatePublishEventProps<TPublishEventProps> = (publishModelEvent: (eventType: string, event: any) => void) => TPublishEventProps;

export type MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

export interface ConnectableComponentProps<TModel = {}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentType;
    /**
     * Provides the means to create a serious of 'publish event' callbacks which will be passed as props to the child view.
     * @deprecated
     */
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    /**
     * Provides the means to map the model to a different shape, the shape will be passed to the connected view.
     * @deprecated
     */
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;

    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export type ConnectableComponentLike =  ({modelId, viewContext, view, ...rest}: ConnectableComponentProps) => (null | React.JSX.Element);

export type ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps = {}> = (view: React.ComponentType) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => React.JSX.Element;

export type ConnectFn<TModel, TModelMappedToProps, TPublishEventProps> = (
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>,
    mappedPropsEqualityFn?: ConnectEqualityFn<TModelMappedToProps>
) => ConnectableComponentFactory<TModel, TPublishEventProps, TModelMappedToProps>;