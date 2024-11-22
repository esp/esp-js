import {observeEvent} from 'esp-js';
import {DynamicProductEvents} from '../../../../events';
import {Product} from '../../product';
import {DynamicProductTileModel} from '../../../dynamicProductTileModel';

export class OptionProductStateHandler {
    @observeEvent(DynamicProductEvents.Products.Option.barrier1_changed)
    _barrier1_changed(draft:Product, event: DynamicProductEvents.Products.CommonProductEvents.NumericValueChangedEvent, model: DynamicProductTileModel) {
        draft.barrier1.barrier = event.newValue;
    }

    @observeEvent(DynamicProductEvents.Products.Option.barrier2_changed)
    _barrier2_changed(draft:Product, event: DynamicProductEvents.Products.CommonProductEvents.NumericValueChangedEvent, model: DynamicProductTileModel) {
        draft.barrier2.barrier = event.newValue;
    }

    @observeEvent(DynamicProductEvents.Products.Option.cuts_loaded)
    _cuts_loaded(draft:Product, event: DynamicProductEvents.Products.Option.CutsLoadedEvent, model: DynamicProductTileModel) {
        draft.cuts = event.cuts;
    }
}