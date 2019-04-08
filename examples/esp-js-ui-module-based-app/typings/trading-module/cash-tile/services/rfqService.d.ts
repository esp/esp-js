import * as Rx from 'rx';
export declare enum RfqStatus {
    Idle = "Idle",
    Requesting = "Requesting",
    Quoting = "Quoting",
    Canceling = "Canceling",
    Executing = "Executing",
    Executed = "Executed",
    Canceled = "Canceled"
}
export interface Quote {
    quoteId: string;
    price: number;
}
export interface RfqRequest {
    rfqId: string;
    ccyPair: string;
    notional: number;
}
export interface CancelRfqRequest {
    rfqId: string;
}
export interface ExecuteOnQuoteRequest {
    rfqId: string;
    quoteId: string;
}
export interface RfqUpdate {
    rfqId: string;
    quote: Quote;
    status: RfqStatus;
}
export interface RfqOperationAck {
    success: boolean;
}
export declare class RfqService {
    requestQuote(request: RfqRequest): Rx.Observable<RfqUpdate>;
    private _logQuoteDebug;
    cancelRfq(request: CancelRfqRequest): Rx.Observable<RfqOperationAck>;
    executeQuote(request: ExecuteOnQuoteRequest): Rx.Observable<RfqOperationAck>;
}
