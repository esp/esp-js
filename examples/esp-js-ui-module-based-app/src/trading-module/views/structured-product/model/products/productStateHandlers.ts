import {observeEvent} from 'esp-js';
import {StructuredProductEvents} from '../../events';
import {Product} from './product';

export class ProductStateHandler {
    @observeEvent(StructuredProductEvents.Product.ccyPair_changed)
    _event1Handler(draft:Product, event: StructuredProductEvents.Product.CcyPairChangedEvent) {
        draft.ccyPair = event.newCcyPair;
    }
}
