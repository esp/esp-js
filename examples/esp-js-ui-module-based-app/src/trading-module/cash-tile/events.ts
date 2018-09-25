import {RfqStatus} from './store/rfq/requestForQuoteState';
import {Quote} from './services/rfqService';

export namespace RootEvents {
    export interface BootstrapEvent { }
    export const bootstrap = 'bootstrap';
}

export namespace RfqEvents {
    export interface RequestQuoteEvent {
        currencyPair: string;
        notional: number;
    }
    export const requestQuote = 'requestQuote';

    export interface RfqUpdateEvent {
        status: RfqStatus;
        quote: Quote;
    }
    export const rfqUpdate = 'rfqUpdate';

    export interface CancelRfqEvent {}
    export const cancelRfq = 'cancelRfq';

    export interface ExecuteOnQuoteEvent {}
    export const executeOnQuote = 'executeOnQuote';
}

export namespace InputEvents {
    export interface CurrencyPairChangedEvent {
        newPair: string;
    }
    export const changeCurrencyPair = 'changeCurrencyPair';

    export interface NotionalChanged {
        notional: number;
    }
    export const notionalChanged = 'notionalChanged';
}

export namespace ReferenceDataEvents {
    export interface CurrencyPairsUpdated {
        newPairs: string[];
    }
    export const currencyPairsUpdated = 'currencyPairsUpdated';
}
