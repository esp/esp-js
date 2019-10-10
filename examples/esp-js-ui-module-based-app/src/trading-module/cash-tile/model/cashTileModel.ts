import {defaultRootStateFactory, RootState} from './root/rootState';
import {defaultRequestForQuoteStateFactory, RequestForQuoteState} from './rfq/requestForQuoteState';
import {defaultInputsStateFactory, InputsState} from './inputs/inputsState';
import {defaultReferenceDataStateFactory, ReferenceDataState} from './refData/referenceDataState';
import {DateSelectorState, defaultDateSelectorStateFactory} from './dateSelector/dateSelectorState';

export interface CashTileModel  {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
    dateSelector: DateSelectorState;
}

export const defaultModelFactory = (modelId: string, ccyPair: string): CashTileModel => {
    return {
        modelId: `cash-tile${modelId}`,
        rootState: defaultRootStateFactory(),
        inputs: defaultInputsStateFactory(ccyPair),
        requestForQuote: defaultRequestForQuoteStateFactory(),
        referenceData: defaultReferenceDataStateFactory(),
        dateSelector: defaultDateSelectorStateFactory()
    };
};
