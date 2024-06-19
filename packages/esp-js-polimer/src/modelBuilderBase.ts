import {isEspDecoratedObject} from 'esp-js';
import {StateHandlerModelMetadata} from './polimerModel';
import {ImmutableModel} from './immutableModel';
import {StateHandlerModel} from './stateHandlerModel';

export class PolimerModelBuilderBase<TModel extends ImmutableModel> {
    protected _stateHandlerObjects: Map<string, any[]> = new Map();
    protected _stateHandlerModels: Map<string, StateHandlerModelMetadata> = new Map();
    protected _eventStreamHandlerObjects: any[] = [];

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
                throw new Error(`Unknown observable object for state ${state}. There was no esp decorator metadata on object passed to 'withObservablesOn(o)'`);
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
}