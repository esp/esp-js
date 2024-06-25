import {observeEvent, Router} from 'esp-js';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream, StateMap, StateHandlerConfiguration} from 'esp-js-polimer';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';
import {StructuredProductEvents} from '../../events';
import {ProductCurrencyPairStateHandler} from './productStateHandlers';
import {StructureProductTileModel} from '../structureProductTileModel';
import {Product, ProductType} from './product';
import * as uuid from 'uuid';

export class AddNewProductsStateHandler {
    @observeEvent(StructuredProductEvents.Products.addProduct_configured)
    _addProductToModel(draft: StateMap<Product>, event: StructuredProductEvents.Products.AddProductConfiguredEvent) {
        let {modelPath, productType} = event;
        let newProductState = {modelPath: modelPath, productType: productType, ccyPair: 'EURUSD', date: null} as Product;
        draft.upsert(modelPath, newProductState);
    }

    @observeEvent(StructuredProductEvents.Products.removeProduct_removed)
    _removeProduct(draft: StateMap<Product>, event: StructuredProductEvents.Products.RemoveProductEvent) {
        let {modelPath} = event;
        draft.deleteByPath(modelPath);
    }
}

export class AddNewProductEventStream {
    private _handlersByModelPath: Map<string, StateHandlerConfiguration[]> = new Map();

    constructor(private _modelId: string, private _router: Router) {
    }

    @eventTransformFor(StructuredProductEvents.Products.addProduct_requested)
    _addProduct(inputEventStream: InputEventStream<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>): OutputEventStream<StructuredProductEvents.Products.AddProductConfiguredEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>) => {
                    // Here we update the current model to add any product-instance-specific state handlers.
                    // Later if/when this product instance is deleted, we can remove the handlers.
                    // It important that anything we add that's product-instance-specific, i.e. specific to an entity in the StateMap, is registered using a StateHandlerConfiguration
                    // Polimer will ensure that the events published will be filtered by the specified StateHandlerConfiguration.modelPath.
                    // This will allow you to have different instances of teh same state handlers with specific configurations.
                    // If you don't have any instance-specific edge cases, then just register the handler at the time you initially create the PolimerModel, i.e. in the ViewFactory.

                    let {event} = inputEvent;
                    let modelPath = uuid.v4();
                    // add some product specific state to show how a handler can be wired up to a specific modelPath only
                    const ccyPairs = event.productType === ProductType.swap
                        ? ['EURUSD', 'USDJPY']
                        : ['GBPAUD'];
                    let stateHandlerConfiguration: StateHandlerConfiguration = {modelPath: modelPath, stateHandler: new ProductCurrencyPairStateHandler(ccyPairs)};
                    // Store the handler for later removal (if/when the product is removed)
                    this._handlersByModelPath.set(modelPath, [stateHandlerConfiguration]); // side effect

                    // Update the models configuration.
                    this._router
                        .modelUpdater<StructureProductTileModel>(this._modelId)
                        .withStateHandlerObject('products', stateHandlerConfiguration)
                        .updateRegistrationsWithRouter();

                    let outputEvent: OutputEvent<StructuredProductEvents.Products.AddProductConfiguredEvent> = {
                        eventType: StructuredProductEvents.Products.addProduct_configured,
                        modelId: this._modelId,
                        event: {
                            modelPath: modelPath,
                            productType: event.productType,
                        }
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }

    @eventTransformFor(StructuredProductEvents.Products.removeProduct_requested)
    _removeProduct(inputEventStream: InputEventStream<StructureProductTileModel, StructuredProductEvents.Products.RemoveProductEvent>): OutputEventStream<StructuredProductEvents.Products.RemoveProductEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<StructureProductTileModel, StructuredProductEvents.Products.RemoveProductEvent>) => {
                    let {event} = inputEvent;
                    let handlerConfigurations = this._handlersByModelPath.get(event.modelPath);
                    this._handlersByModelPath.delete(event.modelPath); // side effect
                    this._router
                        .modelUpdater<StructureProductTileModel>(this._modelId)
                        .removeStateHandlerObject('products', ...handlerConfigurations)
                        .updateRegistrationsWithRouter();
                    let outputEvent: OutputEvent<StructuredProductEvents.Products.RemoveProductEvent> = {
                        eventType: StructuredProductEvents.Products.removeProduct_removed,
                        modelId: this._modelId,
                        event: {
                            modelPath: event.modelPath,
                        }
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }
}