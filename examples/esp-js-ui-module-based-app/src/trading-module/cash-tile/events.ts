import {Quote, RfqStatus} from './services/rfqService';

export namespace TileEvents {
    export const bootstrap = 'bootstrap';
}

export namespace RfqEvents {
    export interface RequestQuoteEvent {
    }
    export const requestQuote = 'requestQuote';

    export interface RfqUpdateEvent {
        rfqId: string;
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

export namespace DateSelectorEvents {
    export interface TenorDateChanged {
        tenor: string;
    }
    export const tenorDateChanged = 'tenorDateChanged';
}