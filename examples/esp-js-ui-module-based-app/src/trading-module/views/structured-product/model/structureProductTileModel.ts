import {StateMap} from 'esp-js-polimer';
import {Product} from './products/';

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
        return {
            modelId: `structured-product-tile-${modelId}`,
            metaState: {
                title: 'Structured Product Tile',
            },
            products: new StateMap<Product>()
        };
    };
}