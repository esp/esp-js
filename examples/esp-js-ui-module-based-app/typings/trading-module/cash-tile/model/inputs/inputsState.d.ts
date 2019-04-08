import { PolimerHandlerMap } from 'esp-js-polimer';
import { CashTileModel } from '../cashTileModel';
export interface InputsState {
    ccyPair: string;
    notional: number;
}
export declare const defaultInputsStateFactory: (ccyPair?: string) => InputsState;
export declare const inputStateHandlerMap: PolimerHandlerMap<InputsState, CashTileModel>;
