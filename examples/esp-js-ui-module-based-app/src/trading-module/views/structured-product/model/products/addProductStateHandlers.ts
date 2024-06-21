import {observeEvent} from 'esp-js';
import {ModelMapState} from 'esp-js-polimer';
import {StructuredProductEvents} from '../../events';
import {Product} from './product';

export class AddProductsStateHandler {
    @observeEvent(StructuredProductEvents.Products.addProduct_configured)
    _addProductToModel(draft:ModelMapState<Product>, event: StructuredProductEvents.Products.AddProductConfiguredEvent) {
        let { newStateId, productType } = event;
        let newProductState = { modelPath: newStateId, productType: productType, ccyPair: 'EURUSD' } as Product;
        draft.upsert(newStateId, newProductState);
    }
}