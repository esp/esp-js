import {observeEvent} from 'esp-js';
import {DynamicProductEvents} from '../../../events';
import {AddProduct} from '../../dynamicProductTileModel';

export class AddProductStateHandler {
    @observeEvent(DynamicProductEvents.AddProduct.productTypeChange)
    _addProductToModel(draft: AddProduct, { productType}: DynamicProductEvents.AddProduct.ProductTypeSelectorChanged) {
        draft.productTypeSelectorSelectedValue = productType;
    }
}