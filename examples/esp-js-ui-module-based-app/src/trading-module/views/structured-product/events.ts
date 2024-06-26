import {ProductType} from './model';

export namespace StructuredProductEvents {
    export const bootstrap = 'bootstrap';

    export namespace Products {
        export const addProduct_requested = 'addProduct_requested';

        export interface AddProductRequestedEvent {
            productType: ProductType;
        }

        export const addProduct_configured = 'addProduct_configured';

        export interface AddProductConfiguredEvent {
            modelPath: string;
            productType: string;
        }

        export const removeProduct_requested = 'removeProduct_requested';
        export const removeProduct_removed = 'removeProduct_removed';

        export interface RemoveProductEvent {
            modelPath: string;
        }
    }

    export namespace Product {
        export const ccyPair_changed = 'ccyPair_changed';

        export interface CcyPairChangedEvent {
            newCcyPair: string;
        }

        export const date_changed = 'date_changed';

        export interface DateChangedEvent {
            newDate: Date;
        }
    }
}
