import {ProductModelConfiguration, ProductType} from './model';
import {ProductPersistedState} from './persistedState';

export namespace DynamicProductEvents {

    export namespace Bootstrapping {
        export const bootstrap = 'bootstrap';

        export interface BootstrapEvent {
            persistedProductStates: ProductPersistedState[];
        }
    }

    export namespace AddProduct {
        export const productTypeChange = 'productTypeChange';

        export interface ProductTypeSelectorChanged {
            productType: ProductType;
        }

        export const addProduct_requested = 'addProduct_requested';

        export const addProduct_configured = 'addProduct_configured';

        export interface AddProductConfiguredEvent {
            productModelConfiguration: ProductModelConfiguration;
        }

        export const productsBootstrappedFromState = 'productsBootstrappedFromState';

        export interface ProductsBootstrappedFromStateEvent {
            bootstrappedProducts: {
                productPersistedState: ProductPersistedState;
                productModelConfiguration: ProductModelConfiguration;
            }[];
        }

        export const removeProduct_requested = 'removeProduct_requested';
        export const removeProduct_removed = 'removeProduct_removed';

        export interface RemoveProductEvent {
            entityKey: string;
        }
    }

    export namespace Products {
        export namespace Option {
            export const barrier1_changed = 'barrier1_changed';
            export const barrier2_changed = 'barrier2_changed';
            export const cuts_loaded = 'cuts_loaded';

            export interface CutsLoadedEvent {
                cuts: string[];
            }
        }

        export namespace Swap {
            export const swapPoints_changed = 'swapPoints_changed';
        }

        export namespace CommonProductEvents {
            export const ccyPair_changed = 'ccyPair_changed';

            export interface CcyPairChangedEvent {
                newCcyPair: string;
            }

            export interface NumericValueChangedEvent {
                newValue: number;
            }
        }
    }
}
