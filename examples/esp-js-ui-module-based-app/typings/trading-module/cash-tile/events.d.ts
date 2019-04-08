import { Quote, RfqStatus } from './services/rfqService';
export declare namespace RootEvents {
    interface BootstrapEvent {
    }
    const bootstrap = "bootstrap";
}
export declare namespace RfqEvents {
    interface RequestQuoteEvent {
    }
    const requestQuote = "requestQuote";
    interface RfqUpdateEvent {
        rfqId: string;
        status: RfqStatus;
        quote: Quote;
    }
    const rfqUpdate = "rfqUpdate";
    interface CancelRfqEvent {
    }
    const cancelRfq = "cancelRfq";
    interface ExecuteOnQuoteEvent {
    }
    const executeOnQuote = "executeOnQuote";
}
export declare namespace InputEvents {
    interface CurrencyPairChangedEvent {
        newPair: string;
    }
    const changeCurrencyPair = "changeCurrencyPair";
    interface NotionalChanged {
        notional: number;
    }
    const notionalChanged = "notionalChanged";
}
export declare namespace ReferenceDataEvents {
    interface CurrencyPairsUpdated {
        newPairs: string[];
    }
    const currencyPairsUpdated = "currencyPairsUpdated";
}
export declare namespace DateSelectorEvents {
    interface TenorDateChanged {
        tenor: string;
    }
    const tenorDateChanged = "tenorDateChanged";
}
