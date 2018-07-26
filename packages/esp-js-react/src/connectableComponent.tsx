import * as React from 'react';
import * as PropTypes from 'prop-types';
import  { Disposable, Router } from 'esp-js';
import {createViewForModel } from './viewBindingDecorator';
import { PublishEvent, publishEvent } from './publishEvent';

export type MapPublishToProps<TPublishProps> = (publishEvent: PublishEvent) => TPublishProps;
export type MapModelToProps<TModel, TProps> = (model: TModel) => TProps;
export type ConnectableComponentProps = {modelId?: string, viewContext?: string};

export interface Props<TModel, TProps, TPublishProps> extends ConnectableComponentProps {
    view?: React.ComponentClass | React.SFC;
    mapPublish?: MapPublishToProps<TPublishProps>;
    modelSelector?: MapModelToProps<TModel, TProps>;
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

export class ConnectableComponent<TModel, TProps, TPublishProps> extends React.Component<Props<TModel, TProps, TPublishProps>, State> {
    private _observationSubscription: Disposable = null;
    context: ConnectableComponentContext;

    static contextTypes = {
        router: PropTypes.instanceOf(Router).isRequired,
        modelId: PropTypes.string
    };

    constructor(props: Props<TModel,  TProps, TPublishProps>, context: ConnectableComponentContext) {
        super(props, context);
        this.state = {model: null};
    }

    componentWillReceiveProps(nextProps: Props<TModel, TProps, TPublishProps>, nextContext: ConnectableComponentContext) {
        const modelId = nextProps.modelId || nextContext.modelId;
        const oldModelId = this._getModelId();

        if (modelId === oldModelId) {
            return;
        }
        
        if(nextProps.modelId === oldModelId) {
            return;
        }

        this._tryObserveModel(modelId);
    }

    componentDidMount() {
        this._tryObserveModel(this._getModelId());
    }

    componentWillUnmount() {
        this._tryDisposeModelSubscription();
    }

    private _getModelId(): string {
        // props override context
        return this.props.modelId || this.context.modelId;
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

        let props = this._getChildProps();
        if(this.props.view) {
            return React.createElement(this.props.view, props);
        }

        return createViewForModel(this.state.model, props, this.props.viewContext);
    }

    private _getChildProps() {
        const {children, mapPublish, modelId, modelSelector, view, viewContext, ...rest} = this.props;
        const distilledModel = this.props.modelSelector ? this.props.modelSelector(this.state.model) : {};
        return {
            modelId: this._getModelId(),
            model: this.state.model,
            router: this.context.router,
            ...distilledModel,
            ...this.state.publishProps,
            ...rest
        };
    }
}

// Lifting 'ConnectableView' into it's own type so it can be exported, else tsc doesn't correctly generated declaration files
export type ConnectableView = React.ComponentClass | React.SFC;

export const connect = function<TModel, TProps, TPublishProps>(modelSelector?: MapModelToProps<TModel, TProps>, mapPublish?: MapPublishToProps<TPublishProps>):
    (view: ConnectableView) => (props: ConnectableComponentProps) => JSX.Element {
    return (view: ConnectableView) => ({modelId, viewContext}: ConnectableComponentProps) => {
        return <ConnectableComponent modelId={modelId} view={view} viewContext={viewContext} mapPublish={mapPublish} modelSelector={modelSelector} />;
    };
};
