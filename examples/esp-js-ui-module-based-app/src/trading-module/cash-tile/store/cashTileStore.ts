import * as uuid from 'uuid';
import {defaultRootStateFactory, RootState} from './root/rootState';
import {defaultRequestForQuoteStateFactory, RequestForQuoteState} from './rfq/requestForQuoteState';
import {defaultInputsStateFactory, InputsState} from './inputs/inputsState';
import {defaultReferenceDataStateFactory, ReferenceDataState} from './refData/referenceDataState';
import {DateSelectorState, defaultDateSelectorStateFactory} from './dateSelector/dateSelectorState';

export interface CashTileStore  {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
    dateSelector: DateSelectorState;
}

export const defaultStoreFactory = (modelId: string, ccyPair: string): CashTileStore => {
    return {
        modelId: `cash-tile${modelId}`,
        rootState: defaultRootStateFactory(),
        inputs: defaultInputsStateFactory(ccyPair),
        requestForQuote: defaultRequestForQuoteStateFactory(),
        referenceData: defaultReferenceDataStateFactory(),
        dateSelector: defaultDateSelectorStateFactory()
    };
};
