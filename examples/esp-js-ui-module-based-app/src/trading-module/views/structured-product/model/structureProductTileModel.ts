import {EspModelEntity, ModelMapState} from 'esp-js-polimer';
import {Product} from './products/productStateHandlers';

export interface StructureProductTileModel {
    modelId: string;
    rootState: RootState;
    products: ModelMapState<Product>;
}

export interface RootState {
    title: string;
}

export namespace StructureProductTileModelBuilder {
    export const createDefault = (modelId: string): StructureProductTileModel => {
        return {
            modelId: `structured-product-tile-${modelId}`,
            rootState: {
                title: 'Structured Product Tile',
            },
            products: new ModelMapState<Product>(new Map([
                ['id-1', {productId: 'barrier'}]
            ]))
        };
    };
}