import * as React from 'react';
import * as PropTypes from 'prop-types';
import  { Disposable, Router } from 'esp-js';
import {createViewForModel } from './viewBindingDecorator';
import { PublishEvent, publishEvent } from './publishEvent';

export type MapPublishToProps<TPublishProps> = (publishEvent: PublishEvent) => TPublishProps;
export type MapModelToProps<TModel, TProps, TOuterProps = {}> = (model: TModel, outerProps: TOuterProps) => TProps;
export type ConnectableComponentProps = {modelId?: string, viewContext?: string};

export interface Props<TModel, TProps, TPublishProps, TOuterProps = {}> extends ConnectableComponentProps {
    view?: React.ComponentClass | React.SFC;
    mapPublish?: MapPublishToProps<TPublishProps>;
    modelSelector?: MapModelToProps<TModel, TProps, TOuterProps & TPublishProps>;
    [key: string]: any;
}

// the props that get passed to the child object.
export interface ConnectableComponentChildProps<TModel> {
    modelId: string;
    model: TModel;
    router: Router;
    [key: string]: any; // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export interface State {
    model?: any;
    publishProps?: any;
}

interface ConnectableComponentContext {
    router: Router;
}

export class ConnectableComponent<TModel, TProps, TPublishProps, TOuterProps = {}> extends React.Component<Props<TModel, TProps, TPublishProps, TOuterProps>, State> {
    private _observationSubscription: Disposable = null;
    context: ConnectableComponentContext;

    static contextTypes = {
        router: PropTypes.instanceOf(Router).isRequired,
    };

    constructor(props: Props<TModel,  TProps, TPublishProps, TOuterProps>, context: ConnectableComponentContext) {
        super(props, context);
        this.state = {model: null};
    }

    componentWillReceiveProps(nextProps: Props<TModel, TProps, TPublishProps, TOuterProps>, nextContext: ConnectableComponentContext) {
        const modelId = nextProps.modelId;
        const oldModelId = this.props.modelId;

        if (modelId === oldModelId) {
            return;
        }
        
        if(nextProps.modelId === oldModelId) {
            return;
        }

        this._tryObserveModel(modelId);
    }

    componentDidMount() {
        this._tryObserveModel(this.props.modelId);
    }

    componentWillUnmount() {
        this._tryDisposeModelSubscription();
    }

    private _tryObserveModel(modelId: string): void {
        this._tryDisposeModelSubscription();

        if (!modelId) {
            return;
        }

        // We only map the publish props once, as for well behaving components
        // these callbacks should never change
        if(this.props.mapPublish) {
            const publishProps = this.props.mapPublish(publishEvent(this.context.router, modelId));
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
        let childProps = this._getChildProps();
        return createViewForModel(this.state.model, childProps, this.props.viewContext, this.props.view);
    }

    private _getChildProps(): ConnectableComponentChildProps<TModel> {
        const {children, mapPublish, modelId, modelSelector, view, viewContext, ...rest} = this.props;
        const outerProps = {
            ...rest,
            ...this.state.publishProps
        };

        const distilledModel = this.props.modelSelector ? this.props.modelSelector(this.state.model, outerProps) : {};
        return {
            modelId: this.props.modelId,
            model: this.state.model,
            router: this.context.router,
            ...distilledModel,
            ...outerProps
        };
    }
}

// Lifting 'ConnectableView' into it's own type so it can be exported, else tsc doesn't correctly generated declaration files
export type ConnectableView = React.ComponentClass | React.SFC;

export const connect = function<TModel, TProps, TPublishProps, TOuterProps = {}>(modelSelector?: MapModelToProps<TModel, TProps, TPublishProps & TOuterProps>, mapPublish?: MapPublishToProps<TPublishProps>):
    (view: ConnectableView) => (props: ConnectableComponentProps) => JSX.Element {
    return (view: ConnectableView) => ({modelId, viewContext}: ConnectableComponentProps) => {
        return <ConnectableComponent modelId={modelId} view={view} viewContext={viewContext} mapPublish={mapPublish} modelSelector={modelSelector} />;
    };
};
