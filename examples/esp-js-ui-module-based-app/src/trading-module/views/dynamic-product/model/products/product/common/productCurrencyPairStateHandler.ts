import {observeEvent} from 'esp-js';
import {DynamicProductEvents} from '../../../../events';
import {Product} from '../../product';

// An example of a state handler that has no state specific to a product.
// It is currently registered for the entire tile rather than with a filter limiting it to a given entity.
// However, it's designed such that the event publisher should publish with an entityKey.
// This will allow the handler to receive an item from the 'product' state, rather than the entire state's map.
export class ProductCurrencyPairStateHandler {
    @observeEvent(DynamicProductEvents.Products.CommonProductEvents.ccyPair_changed)
    _ccyPair_changed(draft:Product, event: DynamicProductEvents.Products.CommonProductEvents.CcyPairChangedEvent) {
        draft.ccyPairField.ccyPair = event.newCcyPair;
    }
}
