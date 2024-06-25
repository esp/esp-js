import {Router, Guard, isEspDecoratedObject} from 'esp-js';
import {PolimerModel, PolimerModelConfig, StateHandlerModelMetadata} from './polimerModel';
import {ImmutableModel} from './immutableModel';
import {ModelPostEventProcessor, ModelPreEventProcessor} from './eventProcessors';
import {StateHandlerModel} from './stateHandlerModel';
import {StateHandlerConfiguration} from './stateHandlerConfiguration';

export class PolimerModelBuilderUpdaterBase<TModel extends ImmutableModel> {
    protected _stateHandlerObjects: Map<string, StateHandlerConfiguration[]> = new Map();
    protected _stateHandlerModels: Map<string, StateHandlerModelMetadata> = new Map();
    protected _eventStreamHandlerObjects: any[] = [];

    /**
     * Used to register handler objects against a state slice on the store.
     * @param state
     * @param handlersOrConfigurations
     */
    withStateHandlerObject<TKey extends keyof TModel>(state: TKey, ...handlersOrConfigurations: (object | StateHandlerConfiguration)[]): this {
        handlersOrConfigurations.forEach(handlerOrConfiguration => {
            const configuration: StateHandlerConfiguration = StateHandlerConfiguration.isHandlerConfiguration(handlerOrConfiguration)
                ? handlerOrConfiguration
                : { stateHandler: handlerOrConfiguration };
            if (isEspDecoratedObject(configuration.stateHandler)) {
                let handlers = this._stateHandlerObjects.get(<string>state);
                if (!handlers) {
                    handlers = [];
                    this._stateHandlerObjects.set(<string>state, handlers);
                }
                handlers.push(configuration);
            } else {
                throw new Error(`Unknown observable object for state ${state}. There was no esp decorator metadata on object passed to 'withObservablesOn(o)'`);
            }
        });
        return this;
    }

    /**
     * Used to register a legacy OO type model which can interact with Polimer models.
     *
     * Typically, this is only used if you have existing OO models which contain both state and event handlers, and you want that model to hang off your store.
     * @param state
     * @param stateHandlerModel
     * @param autoWireUpObservers: if true the given model will be wired up to the model (Router.observeEventsOn(model), this defaults to false as often the given instance may have specific initialisation and observe events itself.
     */
    withStateHandlerModel<TKey extends keyof TModel, TStateHandlerModel extends StateHandlerModel<TModel[TKey]>>(state: TKey, stateHandlerModel: TStateHandlerModel, autoWireUpObservers = false): this  {
        this._stateHandlerModels.set(<string>state, {model: stateHandlerModel, autoWireUpObservers: autoWireUpObservers});
        return this;
    }

    withEventStreamsOn(...objectsToScanForObservables: any[]): this {
        objectsToScanForObservables.forEach(o => {
            if (isEspDecoratedObject(o)) {
                this._eventStreamHandlerObjects.push(o);
            } else {
                throw new Error(`Unknown observable object. There was no esp decorator metadata on object passed to 'withObservablesOn(o)'`);
            }
        });
        return this;
    }
}

export class PolimerModelBuilder<TModel extends ImmutableModel, TPersistedModelState = {}> extends PolimerModelBuilderUpdaterBase<TModel> {
    private _modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    private _modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    private _initialModel: TModel;
    private _stateSaveHandler: (model: TModel) => any;

    constructor(private _router: Router) {
        super();
    }

    withInitialModel(model: TModel): this {
        this._initialModel = model;
        return this;
    }

    withPreEventProcessor(modelPreEventProcessor: ModelPreEventProcessor<TModel>): this {
        this._modelPreEventProcessor = modelPreEventProcessor;
        return this;
    }

    withPostEventProcessor(modelPostEventProcessor: ModelPostEventProcessor<TModel>): this {
        this._modelPostEventProcessor = modelPostEventProcessor;
        return this;
    }

    withStateSaveHandler(handler: (model: TModel) => TPersistedModelState) {
        this._stateSaveHandler = handler;
        return this;
    }

    registerWithRouter(): PolimerModel<TModel> {
        Guard.isDefined(this._initialModel, 'Initial model is not set');
        Guard.stringIsNotEmpty(this._initialModel.modelId, `Initial model's modelId must not be null or empty`);
        Guard.isTruthy(this._stateHandlerObjects.size > 0 || this._stateHandlerModels.size > 0, `ERROR: No state handlers (maps, objects or models) setup for model with id ${this._initialModel.modelId}`);
        // The polimer model is a special case,
        // Some attributes may get bound to it dynamically.
        // Eor example the @viewBinding decorator.
        // Given that, we create a new ctro function to allow custom metadata to be added to this specific instance dynamically.
        let customPolimerModel = class CustomPolimerModel extends PolimerModel<TModel> {};
        return new customPolimerModel(
            this._router,
            <PolimerModelConfig<TModel>>{
                initialModel: this._initialModel,
                stateHandlerObjects: this._stateHandlerObjects,
                stateHandlerModels: this._stateHandlerModels,
                eventStreamHandlerObjects: this._eventStreamHandlerObjects,
                modelPreEventProcessor: this._modelPreEventProcessor,
                modelPostEventProcessor: this._modelPostEventProcessor,
                stateSaveHandler: this._stateSaveHandler,
            }
        );
    }
}

export class PolimerModelUpdater<TModel extends ImmutableModel> extends PolimerModelBuilderUpdaterBase<TModel> {
    protected _stateHandlerObjectsToRemove: Map<string, StateHandlerConfiguration[]> = new Map();
    protected _stateHandlerModelsToRemove: Map<string, StateHandlerModel<any>> = new Map();
    protected _eventStreamHandlerObjectsToRemove: any[] = [];

    constructor(private _router: Router, private _modelId: string) {
        super();
    }

    removeStateHandlerObject<TKey extends keyof TModel>(state: TKey, ...handlersOrConfigurations: (object | StateHandlerConfiguration)[]): this {
        let itemsToRemoveForState = this._stateHandlerObjectsToRemove.get(<string>state);
        if (!itemsToRemoveForState) {
            itemsToRemoveForState = [];
            this._stateHandlerObjectsToRemove.set(<string>state, itemsToRemoveForState);
        }
        const configurations: StateHandlerConfiguration[] = handlersOrConfigurations.map(handlerOrConfiguration => (
            StateHandlerConfiguration.isHandlerConfiguration(handlerOrConfiguration)
                ? handlerOrConfiguration
                : { stateHandler: handlerOrConfiguration }
        ));
        itemsToRemoveForState.push(...configurations);
        return this;
    }

    removeStateHandlerModel<TKey extends keyof TModel, TStateHandlerModel extends StateHandlerModel<TModel[TKey]>>(state: TKey, stateHandlerModel: TStateHandlerModel): this {
        this._stateHandlerModelsToRemove.set(<string>state, stateHandlerModel);
        return this;
    }

    removeEventStreamsFrom(...objectsWithObservablesToRemove: any[]): this {
        this._eventStreamHandlerObjectsToRemove.push(...objectsWithObservablesToRemove);
        return this;
    }

    updateRegistrationsWithRouter(): PolimerModel<TModel> {
        Guard.isDefined(this._modelId, 'model ID to update is not set');
        Guard.isTruthy(this._router.isModelRegistered(this._modelId), `Model with id '${this._modelId}' is not registered with the router`);
        let polimerModel: PolimerModel<TModel> = this._router.getModel(this._modelId);
        polimerModel.update({
            itemsToWireUp: {
                stateHandlerObjects: this._stateHandlerObjects,
                stateHandlerModels: this._stateHandlerModels,
                eventStreamHandlerObjects: this._eventStreamHandlerObjects,
            },
            itemsToUnWire: {
                stateHandlerObjects: this._stateHandlerObjectsToRemove,
                stateHandlerModels: this._stateHandlerModelsToRemove,
                eventStreamHandlerObjects: this._eventStreamHandlerObjectsToRemove,
            }
        });
        return polimerModel;
    }
}

declare module 'esp-js/.dist/typings/router/router' {
    export interface Router {
        modelBuilder?<TModel extends ImmutableModel, TPersistedModelState = {}>(): PolimerModelBuilder<TModel, TPersistedModelState>;
        modelUpdater?<TModel extends ImmutableModel>(existingModelId: string): PolimerModelUpdater<TModel>;
    }
}

Router.prototype.modelBuilder = function <TModel extends ImmutableModel>(): PolimerModelBuilder<TModel> {
    let router = this;
    return new PolimerModelBuilder(router);
};

Router.prototype.modelUpdater = function <TModel extends ImmutableModel>(existingModelId: string): PolimerModelUpdater<TModel> {
    let router = this;
    return new PolimerModelUpdater(router, existingModelId);
};
