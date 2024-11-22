export enum ProductType {
    'swap' = 'swap',
    'option' = 'option'
}

/**
 * Represents a dynamic product
 *
 * For this demo, the product fields are just all flattened onto Product; the modeling is not important for the demo.
 * In a real app then could be flattened, in a map or list structure, or in derived interfaces (i.e., SwapProduct, OptionProduct).
 */
export interface Product {
    productType: ProductType;

    // Common fields
    ccyPairField: CurrencyPairField;

    // Swap Fields
    swapPointsField: SwapPointsField;

    // Option Fields
    barrier1: BarrierField;
    barrier2: BarrierField;
    cuts: string[];

    // Contains metadata about the product's handler and event transform configurations
    productModelConfiguration: ProductModelConfiguration;
}

// Metadata about the product's model configuration
export interface ProductModelConfiguration {
    // A key which can be used when publishing events to the specific entity on a model's state
    entityKey: string;
    productType: ProductType;
    stateHandlers: object[];
    eventTransforms: object[];
}

// Below are some basic field models
// In a real app these could get dynamically added, or enabled/disabled/shown/hidden based on the product type.

export interface ProductField {
    fieldName: string;
}

export interface CurrencyPairField extends ProductField {
    ccyPair: string;
}

export interface SwapPointsField extends ProductField {
    swapPoints: number;
}

export interface BarrierField extends ProductField {
    barrier: number;
}
