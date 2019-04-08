import { RootState } from './root/rootState';
import { RequestForQuoteState } from './rfq/requestForQuoteState';
import { InputsState } from './inputs/inputsState';
import { ReferenceDataState } from './refData/referenceDataState';
import { DateSelectorState } from './dateSelector/dateSelectorState';
export interface CashTileModel {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
    dateSelector: DateSelectorState;
}
export declare const defaultModelFactory: (modelId: string, ccyPair: string) => CashTileModel;
