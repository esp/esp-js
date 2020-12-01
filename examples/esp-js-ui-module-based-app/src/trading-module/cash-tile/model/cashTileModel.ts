import {defaultRootStateFactory, RootState} from './root/rootState';
import {defaultRequestForQuoteStateFactory, RequestForQuoteState} from './rfq/requestForQuoteState';
import {defaultInputsStateFactory, InputsState} from './inputs/inputsState';
import {defaultReferenceDataStateFactory, ReferenceDataState} from './refData/referenceDataState';
import {DateSelectorState, defaultDateSelectorStateFactory} from './dateSelector/dateSelectorState';
import {CashTileState} from '../state/stateModel';

export interface CashTileModel  {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
    dateSelector: DateSelectorState;
}

export namespace CashTileStateUtils {
    export const createDefaultState = (modelId: string, state: CashTileState): CashTileModel => {
        return {
            modelId: `cash-tile-${modelId}`,
            rootState: defaultRootStateFactory(),
            inputs: defaultInputsStateFactory(state ? state.currencyPair : 'EURUSD'),
            requestForQuote: defaultRequestForQuoteStateFactory(),
            referenceData: defaultReferenceDataStateFactory(),
            dateSelector: defaultDateSelectorStateFactory()
        };
    };
}