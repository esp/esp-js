import {CashTilePersistedState} from '../state/stateModel';
import {Quote, RfqStatus} from '../services/rfqService';
import {DateSelectorInitialState} from './dateSelector/dateSelectorModel';

export interface CashTileModel  {
    modelId: string;
    rootState: RootState;
    inputs: InputsState;
    requestForQuote: RequestForQuoteState;
    referenceData: ReferenceDataState;
    dateSelector: DateSelectorState;
}

export interface RootState {
    title: string;
}

export interface InputsState {
    ccyPair: string;
    notional: number;
}

export interface ReferenceDataState {
    currencyPairs: string[];
}

export interface RequestForQuoteState {
    rfqId: string;
    currentQuoteId?: string;
    status: RfqStatus;
    quote?: Quote;
}

export interface DateSelectorState {
    dateInput: string;
    resolvedDate: Date;
    resolvedDateString: string;
}

export namespace CashTileModelBuilder {
    export const createDefault = (modelId: string, state: CashTilePersistedState): CashTileModel => {
        return {
            modelId: `cash-tile-${modelId}`,
            rootState: {
                title: 'Cash Tile',
            },
            inputs: {
                ccyPair: state.currencyPair || 'EURUSD',
                notional: state.notional || 10_000
            },
            requestForQuote: {
                rfqId: null,
                currentQuoteId: null,
                status: RfqStatus.Idle
            },
            referenceData: {
                currencyPairs: ['EURUSD', 'USDJPY', 'EURGBP']
            },
            dateSelector: DateSelectorInitialState
        };
    };
}