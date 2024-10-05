import {Product, ProductModelConfiguration, ProductType} from './products/';
import {ProductPersistedState, DynamicProductPersistedState} from '../persistedState';

export interface DynamicProductTileModel {
    modelId: string;
    title: string;
    addProduct: AddProduct;
    products: Map<string, Product>;
}

export interface AddProduct {
    productTypeSelectorSelectedValue: ProductType;
}

export namespace DynamicProductTileModelBuilder {
    export const createDefault = (modelId: string, persistedState?: DynamicProductPersistedState): DynamicProductTileModel => {
        let defaultModel = {
            modelId: `dynamic-product-tile-${modelId}`,
            title: 'Dynamic Product Tile',
            addProduct: {
                productTypeSelectorSelectedValue: persistedState?.productTypeSelectorValue
                    ? persistedState.productTypeSelectorValue
                    : ProductType.option,
            },
            products: new Map<string, Product>(),
        } as DynamicProductTileModel;
        return defaultModel;
    };

    export const createProduct = (productType: ProductType, productModelConfiguration: ProductModelConfiguration, productPersistedState?: ProductPersistedState) => {
        let product: Product = {
            productType: productType,
            ccyPairField: {
                fieldName: 'CCY Pair',
                ccyPair: undefined,
            },
            swapPointsField: {
                fieldName: 'Swap Points',
                swapPoints: undefined,
            },
            barrier1: {
                fieldName: 'Barrier 1',
                barrier: undefined,
            },
            barrier2: {
                fieldName: 'Barrier 2',
                barrier: undefined,
            },
            cuts: [],
            productModelConfiguration: productModelConfiguration
        };
        if (productPersistedState) {
            product.ccyPairField.ccyPair = productPersistedState?.ccyPairFieldValue;
            product.swapPointsField.swapPoints = productPersistedState?.swapPointsFieldValue;
            product.barrier1.barrier = productPersistedState?.barrier1FieldValue;
            product.barrier2.barrier = productPersistedState?.barrier2FieldValue;
        } else {
            // set up some defaults
            product.ccyPairField.ccyPair = 'EURUSD';
        }
        return product;
    };
}