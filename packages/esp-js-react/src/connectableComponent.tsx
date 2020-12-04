import * as React from 'react';
import * as PropTypes from 'prop-types';
import  { Disposable, Router, EspDecoratorUtil, utils } from 'esp-js';
import {createViewForModel } from './viewBindingDecorator';
import {GetEspReactRenderModelConsts, GetEspReactRenderModelMetadata} from './getEspReactRenderModel';
import {ClassType, ComponentClass, FunctionComponent} from 'react';

export type PublishEvent = (eventType: string, event: any) => void;

export type CreatePublishEventProps<TPublishEventProps> = (publishEvent: PublishEvent) => TPublishEventProps;

export type MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps = {}> = (model: TModel, publishEventProps: TPublishEventProps) => TModelMappedToProps;

export type ViewComponentTypes = React.FunctionComponent | React.ClassType<any, any, any> | React.ComponentClass;

export interface ConnectableComponentProps<TModel ={}, TPublishEventProps = {}, TModelMappedToProps = {}> {
    modelId?: string;
    viewContext?: string;
    view?: ViewComponentTypes;
    /**
     * Provides a means to create a serious of 'publish event' callbacks which will be passed as props to the child view.
     */
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>;
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>;
    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export interface ConnectableComponentChildProps<TModel> {
    modelId: string;
    model: TModel;
    router: Router;
    [key: string]: any; // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}

export interface State {
    model?: any;
    publishProps?: any;
    publishEvent?: PublishModelEventDelegate;
}

interface ConnectableComponentContext {
    router: Router;
    modelId: string;
}

export type PublishModelEventDelegate = (eventType: string, event: any) => void;

export const PublishModelEventContext = React.createContext<PublishModelEventDelegate>(null);

export const HooksPublishModelEventProvider = PublishModelEventContext.Provider;

export class ConnectableComponent<TModel, TPublishEventProps = {}, TModelMappedToProps = {}> extends React.Component<ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, State> {
    private _observationSubscription: Disposable = null;
    context: ConnectableComponentContext;

    static contextTypes = {
        router: PropTypes.instanceOf(Router).isRequired,
        modelId: PropTypes.string
    };

    constructor(props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, context: ConnectableComponentContext) {
        super(props, context);
        this.state = {model: null};
    }

    componentWillReceiveProps(nextProps: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>, nextContext: ConnectableComponentContext) {
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

        let stateChanged = false;

        let publishEvent = this.state.publishEvent;
        if (!publishEvent) {
            publishEvent = this._publishEvent(this.context.router, modelId);
            stateChanged = true;
        }

        let publishProps = this.state.publishProps;
        // We only map the publish props once, as for well behaving components these callbacks should never change
        if (!publishProps && this.props.createPublishEventProps) {
            publishProps = this.props.createPublishEventProps(publishEvent);
            stateChanged = true;
        }

        if (stateChanged) {
            this.setState({
                publishEvent,
                publishProps
            });
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

    private _publishEvent = (router: Router, modelId: string) => (eventType: string, event: any) => router.publishEvent(modelId, eventType, event);

    public render() {
        if(this.state.model == null) {
            return null;
        }
        let childProps = this._getChildProps();
        let view = createViewForModel(this.state.model, childProps, this.props.viewContext, this.props.view);
        return (<HooksPublishModelEventProvider value={this.state.publishEvent}>{view}</HooksPublishModelEventProvider>);
    }

    private _getChildProps(): ConnectableComponentChildProps<TModel> {
        // consume what this component owns, and let the rest end up in `...rest`
        const {children, createPublishEventProps, modelId, mapModelToProps, view, viewContext, ...rest} = this.props;
        const model = this._getRenderModel(this.state.model);
        let childProps = {
            modelId,
            router: this.context.router,
            ...rest,
            ...this.state.publishProps,
            model
        };
        if (this.props.mapModelToProps) {
            childProps = {
                ...childProps,
                ...(this.props.mapModelToProps(model, this.state.publishProps) as any)
            };
        }
        return childProps;
    }

    /**
     * Sees if there is a special selector function which can be invoked to return a render model rather than the top level model model itself
     */
    private _getRenderModel(model: any): TModel {
        // does the given model have a decorated function we can invoke to get a different model to render?
        if (EspDecoratorUtil.hasMetadata(model)) {
            let metadata: GetEspReactRenderModelMetadata = EspDecoratorUtil.getCustomData(model, GetEspReactRenderModelConsts.CustomDataKey);
            if (metadata) {
                return model[metadata.functionName]();
            }
        }
        // else see if there is a function with name GetEspReactRenderModelConsts.HandlerFunctionName we can invoke to get a different model to render?
        let renderModelGetter = model[GetEspReactRenderModelConsts.HandlerFunctionName];
        if (renderModelGetter && utils.isFunction(renderModelGetter)) {
            return renderModelGetter.call(model);
        }
        // else just return the default model
        return model;
    }
}

// Lifting 'ConnectableView' into it's own type so it can be exported, else tsc doesn't correctly generated declaration files
export type ConnectableView = React.ComponentClass | React.SFC;

export const connect = function<TModel, TPublishEventProps, TModelMappedToProps = {}>(
    mapModelToProps?: MapModelToProps<TModel, TModelMappedToProps, TPublishEventProps>,
    createPublishEventProps?: CreatePublishEventProps<TPublishEventProps>
): (view: ConnectableView) => (props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) => JSX.Element {
    return function(view: ConnectableView) {
        return function(props: ConnectableComponentProps<TModel, TPublishEventProps, TModelMappedToProps>) {
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