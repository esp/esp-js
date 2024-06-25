import {observeEvent, Router} from 'esp-js';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream, StateMap} from 'esp-js-polimer';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';
import {StructuredProductEvents} from '../../events';
import {ProductCurrencyPairStateHandler} from './productStateHandlers';
import {StructureProductTileModel} from '../structureProductTileModel';
import {Product, ProductType} from './product';
import * as uuid from 'uuid';

export class AddProductsStateHandler {
    @observeEvent(StructuredProductEvents.Products.addProduct_configured)
    _addProductToModel(draft: StateMap<Product>, event: StructuredProductEvents.Products.AddProductConfiguredEvent) {
        let {modelPath, productType} = event;
        let newProductState = {modelPath: modelPath, productType: productType, ccyPair: 'EURUSD', date: null} as Product;
        draft.upsert(modelPath, newProductState);
    }
}

export class AddNewProductEventStream {

    constructor(private _modelId: string, private _router: Router) {
    }

    @eventTransformFor(StructuredProductEvents.Products.addProduct_requested)
    _addProduct(inputEventStream: InputEventStream<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>): OutputEventStream<StructuredProductEvents.Products.AddProductConfiguredEvent> {
        return inputEventStream
            .pipe(
                map((inputEvent: InputEvent<StructureProductTileModel, StructuredProductEvents.Products.AddProductRequestedEvent>) => {

                    let { model, event } = inputEvent;

                    let modelPath = uuid.v4();

                    // add some product specific state to show how a handler can be wrired up to a specific modelPath only
                    const ccyPairs = event.productType === ProductType.swap
                        ? ['EURUSD', 'USDJPY']
                        : ['GBPAUD'];

                    this._router
                        .modelUpdater<StructureProductTileModel>(this._modelId)
                        .withStateHandlerObject('products', { modelPath: modelPath, stateHandler: new ProductCurrencyPairStateHandler(ccyPairs) })
                        .updateRegistrationsWithRouter();

                    let outputEvent: OutputEvent<StructuredProductEvents.Products.AddProductConfiguredEvent> = {
                        eventType: StructuredProductEvents.Products.addProduct_configured,
                        modelId: this._modelId,
                        event: {
                            modelPath: modelPath,
                            productType: event.productType
                        }
                    };
                    return of(outputEvent);
                }),
                switchAll()
            );
    }
}