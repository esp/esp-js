import * as React from 'react';
import * as PropTypes from 'prop-types';
import { Router } from 'esp-js';
export declare type PublishEvent = (eventType: string, event: any) => void;
export declare type CreatePublishEventProps<TPublishEventProps> = (publishEvent: PublishEvent) => TPublishEventProps;
export declare type MapModelToProps<TModel, TModelMappedToProps> = (model: TModel) => TModelMappedToProps;
export interface ConnectableComponentProps<TModel, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    viewContext?: string;
    view?: React.ComponentClass | React.SFC;
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps>;
    [key: string]: any;
}
export interface ConnectableComponentChildProps<TModel> {
    modelId: string;
    model: TModel;
    router: Router;
    [key: string]: any;
}
export interface State {
    model?: any;
    publishProps?: any;
}
interface ConnectableComponentContext {
    router: Router;
    modelId: string;
}
export declare class ConnectableComponent<TModel, TPublishEventProps = {}, TModelMappedToProps = {}> extends React.Component<ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, State> {
    private _observationSubscription;
    context: ConnectableComponentContext;
    static contextTypes: {
        router: PropTypes.Validator<Router>;
        modelId: PropTypes.Requireable<string>;
    };
    constructor(props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, context: ConnectableComponentContext);
    componentWillReceiveProps(nextProps: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, nextContext: ConnectableComponentContext): void;
    componentDidMount(): void;
    componentWillUnmount(): void;
    private _getModelId;
    private _tryObserveModel;
    private _tryDisposeModelSubscription;
    private _publishEvent;
    render(): React.ReactElement<{}, string | ((props: any) => React.ReactElement<any, string | any | (new (props: any) => React.Component<any, any, any>)>) | (new (props: any) => React.Component<any, any, any>)>;
    private _getChildProps;
    /**
     * Sees if there is a special selector function which can be invoked to return a render model rather than the top level model model itself
     */
    private _getRenderModel;
}
export declare type ConnectableView = React.ComponentClass | React.SFC;
export declare const connect: <TModel, TPublishEventProps, TModelMappedToProps = {}>(mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps>, createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>) => (view: React.ComponentClass<{}, any> | React.FunctionComponent<{}>) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => JSX.Element;
export {};
