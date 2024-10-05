import {observeEvent} from 'esp-js';
import {DynamicProductEvents} from '../../../../events';
import {Product} from '../../product';

export class SwapProductStateHandler {
    @observeEvent(DynamicProductEvents.Products.Swap.swapPoints_changed)
    _swapPoints_changed(draft:Product, event: DynamicProductEvents.Products.CommonProductEvents.NumericValueChangedEvent) {
        draft.swapPointsField.swapPoints = event.newValue;
    }
}