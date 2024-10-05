import {observeEvent} from 'esp-js';
import {DynamicProductEvents} from '../../../events';
import {Product, ProductModelConfiguration} from '../product';
import {DynamicProductTileModelBuilder} from '../../dynamicProductTileModel';
import {ProductPersistedState} from '../../../persistedState';

/**
 * A state handler acts on the 'addProduct' state.
 * It receives the entire Map<string, Product> as its draft.
 */
export class AddProductFactoryStateHandler {
    @observeEvent(DynamicProductEvents.AddProduct.productsBootstrappedFromState)
    _productsBootstrappedFromState(draft: Map<string, Product>, event: DynamicProductEvents.AddProduct.ProductsBootstrappedFromStateEvent) {
        let {bootstrappedProducts} = event;
        bootstrappedProducts.forEach(({productPersistedState, productModelConfiguration}) => {
            this._addProductToState(draft, productModelConfiguration, productPersistedState);
        });
    }

    @observeEvent(DynamicProductEvents.AddProduct.addProduct_configured)
    _addProductToModel(draft: Map<string, Product>, event: DynamicProductEvents.AddProduct.AddProductConfiguredEvent) {
        let {productModelConfiguration} = event;
        this._addProductToState(draft, productModelConfiguration);
    }

    @observeEvent(DynamicProductEvents.AddProduct.removeProduct_removed)
    _removeProduct(draft: Map<string, Product>, event: DynamicProductEvents.AddProduct.RemoveProductEvent) {
        draft.delete(event.entityKey);
    }

    private _addProductToState = (draft: Map<string, Product>, productModelConfiguration: ProductModelConfiguration, productPersistedState?: ProductPersistedState) => {
        let newProductState: Product = DynamicProductTileModelBuilder.createProduct(
            productModelConfiguration.productType,
            productModelConfiguration,
            productPersistedState
        );
        draft.set(productModelConfiguration.entityKey, newProductState);
    };
}