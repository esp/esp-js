import * as React from 'react';
import * as PropTypes from 'prop-types';
import  { Disposable, Router } from 'esp-js';
import {createViewForModel } from './viewBindingDecorator';
import { PublishEvent, publishEvent } from './publishEvent';

export type MapPublishToProps<TPublishProps> = (publishEvent: PublishEvent) => TPublishProps;
export type MapModelToProps<TModel, TProps> = (model: TModel) => TProps;
export type ConnectableComponentProps = {modelId: string, viewContext?: string};

export interface Props<TModel, TProps, TPublishProps> extends ConnectableComponentProps {
    view?: React.ComponentClass | React.SFC;
    mapPublish?: MapPublishToProps<TPublishProps>;
    modelSelector?: MapModelToProps<TModel, TProps>;
}

export interface State {
    model?: any;
    publishProps?: any;
}

export class ConnectableComponent<TModel, TProps, TPublishProps> extends React.Component<Props<TModel, TProps, TPublishProps>, State> {
    private _observationSubscription: Disposable = null;

    constructor(props: Props<TModel,  TProps, TPublishProps>, context: any) {
        super(props, context);
        this.state = {model: null};
    }

    componentWillReceiveProps(nextProps: Props<TModel, TProps, TPublishProps>) {
        if(nextProps.modelId === this.props.modelId) {
            return;
        }

        this._tryObserveModel(nextProps.modelId);
    }

    componentDidMount() {
        this._tryObserveModel(this.props.modelId);
    }

    componentWillUnmount() {
        this._tryDisposeModelSubscription();
    }

    private _tryObserveModel(modelId: string): void {
        this._tryDisposeModelSubscription();

        // We only map the publish props once, as for well behaving components
        // these callbacks should never change
        if(this.props.mapPublish) {
            const publishProps = this.props.mapPublish(publishEvent(this.context.router, this.props.modelId));
            this.setState({publishProps});
        }

        this._observationSubscription = this.context.router
            .getModelObservable(modelId)
            .subscribe(model => this.setState({model}));
    }

    private _tryDisposeModelSubscription() {
        if(this._observationSubscription) {
            this.setState({model: null});
            this._observationSubscription.dispose();
        }
    }

    public render() {
        if(this.state.model == null) {
            return null;
        }

        if(this.props.view) {
            return React.createElement(this.props.view, this._getChildProps());
        }

        return createViewForModel(this.state.model, this._getChildProps(), this.props.viewContext);
    }

    private _getChildProps() {
        const distilledModel = this.props.modelSelector ? this.props.modelSelector(this.state.model) : {};
        return {
            model: this.state.model,
            router: this.context.router,
            ...distilledModel,
            ...this.state.publishProps
        };
    }
}

export const connect = function<TModel, TProps, TPublishProps>(modelSelector?: MapModelToProps<TModel, TProps>, mapPublish?: MapPublishToProps<TPublishProps>) {
    return (view: React.ComponentClass | React.SFC) => ({modelId, viewContext}: ConnectableComponentProps) => {
        return <ConnectableComponent modelId={modelId} view={view} viewContext={viewContext} mapPublish={mapPublish} modelSelector={modelSelector} />;
    };
};
