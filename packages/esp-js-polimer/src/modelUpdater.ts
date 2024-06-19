import {Router, Guard} from 'esp-js';
import {PolimerModel} from './polimerModel';
import {ImmutableModel} from './immutableModel';
import {PolimerModelBuilderBase} from './modelBuilderBase';
import {StateHandlerModel} from './stateHandlerModel';

declare module 'esp-js/.dist/typings/router/router' {
    export interface Router {
        modelUpdater?<TModel extends ImmutableModel>(): PolimerModelUpdater<TModel>;
    }
}

export class PolimerModelUpdater<TModel extends ImmutableModel> extends PolimerModelBuilderBase<TModel> {
    private _modelId: string;

    constructor(private _router: Router) {
        super();
    }

    withExistingModel(modelId: string): this {
        this._modelId = modelId;
        return this;
    }

    removeStateHandlerObject<TKey extends keyof TModel>(state: TKey, ...objectToScanForHandlers: any[]): this {
        return this;
    }

    removeStateHandlerModel<TKey extends keyof TModel, TStateHandlerModel extends StateHandlerModel<TModel[TKey]>>(state: TKey, stateHandlerModel: TStateHandlerModel): this {
        return this;
    }

    removeEventStreamsFrom(...objectsToScanForObservables: any[]): this {
        return this;
    }

        // how this works:
        // just like normal handlers, but:
        // if the event has a model path, we use that to find the specific item in the map, we just mutat that.
        //
        // Model Path ideas:
        // Single item: some-id, or /items/some-id
        // Single with path: : https://www.reddit.com/r/learnjavascript/comments/14rkb6z/using_a_string_that_shows_a_path_to_an_object/
        // "items/[0]/children/[1]" which you'd .split into an array as per the above example
        // Multiple:
        // This is perhaps best if it was supported by modelpath, i.e. if modelPath was an array.
        // so rather than modelPath, it should be 'address | address[]'
        // we could also have a path that's like /items/0-5, or /items/some-id

        // for now lets assume one

        // use the normal state handlers:
        // IF the event has a path, select the specific part
        // Else use the entire state slice


        // Plan
        // [x] Immer spike to understand how it works with classes, thus MapState
        // [ ] Add map state support to the existing state handler logic below
        // [ ] single address only
        // [ ] update model builder so it can re-configure a part of the model
        // [ ] Add the opposite of withStateHandlerObject : removeStateHandlerObject(state, instance)
        //     [ ] update PolimerModel so event subscriptions lifecycle (in _wireUpStateHandlerObjects) are bound to the class that has the method, not the entire polimer model.
        //
        // vNext
        // [ ] add multiple address to the router (replacing model path)
        //

    update(): PolimerModel<TModel> {
        Guard.isDefined(this._modelId, 'Initial model is not set');
        Guard.stringIsNotEmpty(this._router.isModelRegistered(this._modelId), `Model with id '${this._modelId}' is not registered with the router`);

        let polimerModel: PolimerModel<TModel> = this._router.getModel(this._modelId);

        return polimerModel;
    }
}

Router.prototype.modelUpdater = function <TModel extends ImmutableModel>(): PolimerModelUpdater<TModel> {
    let router = this;
    return new PolimerModelUpdater(router);
};
