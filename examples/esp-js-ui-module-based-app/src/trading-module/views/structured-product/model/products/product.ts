import {EspModelEntity} from 'esp-js-polimer';

export interface Product extends EspModelEntity {
    productType: string;
    ccyPair: string;
}