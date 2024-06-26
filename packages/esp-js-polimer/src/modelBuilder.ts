import {Router, Guard, isEspDecoratedObject} from 'esp-js';
import {PolimerModel, PolimerModelSetup, StateHandlerModelMetadata} from './polimerModel';
import {ImmutableModel} from './immutableModel';
import {StateHandlerModel} from './stateHandlerModel';
import {ModelPostEventProcessor, ModelPreEventProcessor} from './eventProcessors';

declare module 'esp-js/.dist/typings/router/router' {
    export interface Router {
        modelBuilder?<TModel extends ImmutableModel, TPersistedModelState = {}>(): PolimerModelBuilder<TModel, TPersistedModelState>;
    }
}

export class PolimerModelBuilder<TModel extends ImmutableModel, TPersistedModelState = {}> {
    private _stateHandlerObjects: Map<string, any[]> = new Map();
    private _stateHandlerModels: Map<string, StateHandlerModelMetadata> = new Map();
    private _eventStreamHandlerObjects: any[] = [];
    private _modelPreEventProcessor: ModelPreEventProcessor<TModel>;
    private _modelPostEventProcessor: ModelPostEventProcessor<TModel>;
    private _initialModel: TModel;
    private _stateSaveHandler: (model: TModel) => any;

    constructor(private _router: Router) {
    }

    withInitialModel(model: TModel): this {
        this._initialModel = model;
        return this;
    }

    withStateHandlerObject<TKey extends keyof TModel>(state: TKey, ...objectToScanForHandlers: any[]): this {
        objectToScanForHandlers.forEach(handler => {
            if (isEspDecoratedObject(handler)) {
                let handlers = this._stateHandlerObjects.get(<string>state);
                if (!handlers) {
                    handlers = [];
                    this._stateHandlerObjects.set(<string>state, handlers);
                }
                handlers.push(handler);
            } else {
                throw new Error(`Unknown observable object for state ${<string>state}. There was no esp decorator metadata on object passed to 'withObservablesOn(o)'`);
            }
        });
        return this;
    }

    /**
     *
     * @param state
     * @param stateHandlerModel
     * @param autoWireUpObservers: if true the given model will be wired up to the model (Router.observeEventsOn(model), this defaults to false as often the given instance may have specific initialisation and observe events itself.
     */
    withStateHandlerModel<TKey extends keyof TModel, TStateHandlerModel extends StateHandlerModel<TModel[TKey]>>(state: TKey, stateHandlerModel: TStateHandlerModel, autoWireUpObservers = false): this  {
        this._stateHandlerModels.set(<string>state, {model: stateHandlerModel, autoWireUpObservers});
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
        let polimerModel = new customPolimerModel(
            this._router,
            <PolimerModelSetup<TModel>>{
                initialModel: this._initialModel,
                stateHandlerObjects: this._stateHandlerObjects,
                stateHandlerModels: this._stateHandlerModels,
                eventStreamHandlerObjects: this._eventStreamHandlerObjects,
                modelPreEventProcessor: this._modelPreEventProcessor,
                modelPostEventProcessor: this._modelPostEventProcessor,
                stateSaveHandler: this._stateSaveHandler,
            }
        );

        this._router.addModel(this._initialModel.modelId, polimerModel);

        polimerModel.initialize();

        return polimerModel;
    }
}

Router.prototype.modelBuilder = function <TModel extends ImmutableModel>(): PolimerModelBuilder<TModel> {
    let router = this;
    return new PolimerModelBuilder(router);
};
