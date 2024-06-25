import {observeEvent} from 'esp-js';
import {StructuredProductEvents} from '../../events';
import {Product} from './product';

export class ProductDateStateHandler {
    @observeEvent(StructuredProductEvents.Product.date_changed)
    _event1Handler(draft:Product, event: StructuredProductEvents.Product.DateChangedEvent) {
        draft.date = event.newDate;
    }
}

export class ProductCurrencyPairStateHandler {
    constructor(private _productSpecificCurrencyPairs: string[]) {
    }
    @observeEvent(StructuredProductEvents.Product.ccyPair_changed)
    _event1Handler(draft:Product, event: StructuredProductEvents.Product.CcyPairChangedEvent) {
        if (this._productSpecificCurrencyPairs.includes(event.newCcyPair)) {
            draft.ccyPair = event.newCcyPair;
        } else {
            draft.ccyPair = `Invalid selection ${event.newCcyPair}`;
        }
    }
}
