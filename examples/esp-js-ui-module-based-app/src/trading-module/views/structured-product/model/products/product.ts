export enum ProductType {
    'swap' = 'swap',
    'option' = 'option'
}

export interface Product {
    productType: ProductType;
    ccyPair: string;
    date: Date;
}