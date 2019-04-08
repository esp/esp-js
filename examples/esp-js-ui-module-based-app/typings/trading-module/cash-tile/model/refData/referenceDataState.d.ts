import { PolimerHandlerMap } from 'esp-js-polimer';
import { CashTileModel } from '../cashTileModel';
export interface ReferenceDataState {
    currencyPairs: string[];
}
export declare const defaultReferenceDataStateFactory: () => ReferenceDataState;
export declare const referenceDataStateHandlerMap: PolimerHandlerMap<ReferenceDataState, CashTileModel>;
