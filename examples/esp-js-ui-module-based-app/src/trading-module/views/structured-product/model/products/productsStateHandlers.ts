import {observeEvent} from 'esp-js';
import {ModelMapState, EspModelEntity} from 'esp-js-polimer';
import {StructuredProductEvents} from '../../events';

export interface Product extends EspModelEntity {
    productType: string;
    ccyPair: string;
}

export class ProductsStateHandler {
    @observeEvent(StructuredProductEvents.Products.addProduct_configured)
    _event1Handler(draft:ModelMapState<Product>, event: StructuredProductEvents.Products.AddProductConfiguredEvent) {
        let { newStateId, productType } = event;
        let newProductState = { espEntityId: newStateId, productType: productType, ccyPair: 'EURUSD' } as Product;
        draft.upsert(newStateId, newProductState);
    }
}

export class ProductStateHandler {
    @observeEvent(StructuredProductEvents.Product.ccyPair_changed)
    _event1Handler(draft:Product, event: StructuredProductEvents.Product.CcyPairChangedEvent) {
        draft.ccyPair = event.newCcyPair;
    }
}
