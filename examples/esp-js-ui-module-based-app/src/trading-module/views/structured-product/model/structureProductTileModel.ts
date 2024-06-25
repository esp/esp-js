import {StateMap} from 'esp-js-polimer';
import {Product, ProductType} from './products/';
import * as uuid from 'uuid';

export interface StructureProductTileModel {
    modelId: string;
    metaState: StructureProductTileMetaState;
    products: StateMap<Product>;
}

export interface StructureProductTileMetaState {
    title: string;
}

export namespace StructureProductTileModelBuilder {
    export const createDefault = (modelId: string): StructureProductTileModel => {
        let modelPath = uuid.v4();
        return {
            modelId: `structured-product-tile-${modelId}`,
            metaState: {
                title: 'Structured Product Tile',
            },
            products: new StateMap<Product>(new Map([
                [modelPath, { productType: ProductType.swap, ccyPair: 'EURUSD', date: null}],
            ]))
        };
    };
}