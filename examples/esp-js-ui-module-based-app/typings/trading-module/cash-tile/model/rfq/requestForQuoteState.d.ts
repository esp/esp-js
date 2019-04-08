import { RfqEvents } from '../../events';
import { CashTileModel } from '../cashTileModel';
import { Quote, RfqStatus } from '../../services/rfqService';
export interface RequestForQuoteState {
    rfqId: string;
    currentQuoteId?: string;
    status: RfqStatus;
    quote?: Quote;
}
export declare const defaultRequestForQuoteStateFactory: () => RequestForQuoteState;
export declare class RequestForQuoteStateHandlers {
    constructor();
    onRequestQuote(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, model: CashTileModel): void;
    onRfqUpdated(draft: RequestForQuoteState, event: RfqEvents.RfqUpdateEvent, model: CashTileModel): void;
    onCancelQuote(draft: RequestForQuoteState, event: RfqEvents.CancelRfqEvent, model: CashTileModel): void;
    onExecuting(draft: RequestForQuoteState, event: RfqEvents.ExecuteOnQuoteEvent, model: CashTileModel): void;
    onInputsChanged(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, model: CashTileModel): void;
}
