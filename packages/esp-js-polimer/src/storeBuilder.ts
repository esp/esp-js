import {Router, Guard, EspDecoratorUtil, EventObservationMetadata, isEspDecoratedObject} from 'esp-js';
import {PolimerHandlerMap} from './eventHandlers';
import {PolimerModel} from './polimerModel';
import {OutputEvent, OutputEventStreamFactory, InputEventStreamFactory} from './eventStreamObservable';
import * as Rx from 'rx';
import {Store} from './store';

declare module 'esp-js/.dist/typings/router/router' {
    export interface Router {
        /**
         * Creates a store builder which can be configured and ultimately added to the router
         * @param name: a friendly name for the store, ends up being used in dev tools
         * @param modelId: the modelId for the store, used by the router so events can be dispatched to the store
         */
        storeBuilder?<TStore extends Store>(name: string): PolimerStoreBuilder<TStore>;
    }
}

export class PolimerStoreBuilder<TStore extends Store> {
    private _stateHandlerMaps: Map<string, PolimerHandlerMap<any, TStore>> = new Map();
    private _outputEventStreamFactories: OutputEventStreamFactory<TStore, any, any>[] = [];
    private _initialStore: TStore;

    constructor(private _router: Router, private _name: string) {
    }

    withInitialStore(store: TStore): PolimerStoreBuilder<TStore> {
        this._initialStore = store;
        return this;
    }

    withStateHandler<TKey extends keyof TStore, TState extends TStore[TKey]>(state: TKey, handlerMap: PolimerHandlerMap<TState, TStore>): PolimerStoreBuilder<TStore> {
        this._stateHandlerMaps.set(<string>state, handlerMap);
        return this;
    }

    withStateHandlersOn<TKey extends keyof TStore>(state: TKey, objectToScanForHandlers: any): PolimerStoreBuilder<TStore> {
        if (isEspDecoratedObject(objectToScanForHandlers)) {
            // create a new handler map which has the eventType as the key
            // we should just omit the decorator and just use function names, but there can be more than one decorators on a function
            let handlerMap: PolimerHandlerMap<any, TStore> = {};
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForHandlers);
            events.forEach(metadata => {
                // copy the decorated function to our new map
                handlerMap[metadata.eventType] = objectToScanForHandlers[metadata.functionName];
            });
            this.withStateHandler(<keyof TStore>state, handlerMap);
        } else {
            throw new Error(`Unknown observable object. Now esp decorator metadata on object passed to 'withObservablesOn(o)'`);
        }
        return this;
    }

    withEventStreams(...outputEventStreamFactory: OutputEventStreamFactory<TStore, any, any>[]): PolimerStoreBuilder<TStore> {
        this._outputEventStreamFactories.push(...outputEventStreamFactory);
        return this;
    }

    withEventStreamsOn(objectToScanForObservables: any): PolimerStoreBuilder<TStore> {
        if (isEspDecoratedObject(objectToScanForObservables)) {
            let events: EventObservationMetadata[] = EspDecoratorUtil.getAllEvents(objectToScanForObservables);
            events.forEach(metadata => {
                // Create a late bound function that takes a factory, invokes it, and passes the resultant event stream to the decorated function on objectToScanForObservables.
                // The decorated function will receive hte input event, and transform it ot an output event
                const outputEventStreamFactory: OutputEventStreamFactory<TStore, any, any> = (getInputEventStreamFor: InputEventStreamFactory<any, TStore>) => {
                    let decoratedFunction = objectToScanForObservables[metadata.functionName];
                    let eventStream = getInputEventStreamFor(metadata.eventType);
                    return <Rx.Observable<OutputEvent<any>>>decoratedFunction(eventStream);
                };
                this.withEventStreams(outputEventStreamFactory);
            });
        } else {
            throw new Error(`Unknown observable object. Now esp decorator metadata on object passed to 'withObservablesOn(o)'`);
        }
        return this;
    }

    registerWithRouter(): PolimerModel<TStore> {
        Guard.stringIsNotEmpty(this._name, 'No name specified for store');
        Guard.isDefined(this._initialStore, 'Initial store is not set');
        Guard.isDefined(this._initialStore.modelId, `Initial store's modelId is not set`);
        Guard.isTruthy(this._stateHandlerMaps.size > 0, `No states setup for store ${this._name}`);

        // The polimer model is a special case,
        // Some attributes may get bound to it dynamically.
        // Eor example the @viewBinding decorator.
        // Given that, we create a new ctro function to allow custom metadata to be added to this specific instance dynamically.
        let customPolimerModel = class CustomPolimerModel extends PolimerModel<TStore> {};
        let polimerModel = new customPolimerModel(
            this._router,
            this._initialStore,
            this._name,
            this._stateHandlerMaps,
            this._outputEventStreamFactories
        );

        this._router.addModel(
            this._initialStore.modelId,
            polimerModel
            // TODO wire this up
         //    {modelObservableMapper: (model: PolimerModel<TStore>) => model.getStore()}
        );

        polimerModel.initialize();

        return polimerModel;
    }
}

Router.prototype.storeBuilder = function <TStore extends Store>(name: string): PolimerStoreBuilder<TStore> {
    let router = this;
    return new PolimerStoreBuilder(router, name);
};
