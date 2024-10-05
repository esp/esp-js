import {ProductType} from '../model';

export interface ProductPersistedState {
    productType: ProductType;
    ccyPairFieldValue: string;
    swapPointsFieldValue: number;
    barrier1FieldValue: number;
    barrier2FieldValue: number;
}

export interface DynamicProductPersistedState {
    productTypeSelectorValue: ProductType;
    products: ProductPersistedState[];
}