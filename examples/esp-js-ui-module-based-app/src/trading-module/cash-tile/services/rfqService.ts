import * as Rx from 'rx';

export interface Quote {
    quoteId: string;
    price: number;
}

export interface RfqRequest {
    rfqId: string;
}

export interface CancelRfqRequest {
    rfqId: string;
}

export interface ExecuteOnQuoteRequest {
    rfqId: string;
    quoteId: string;
}

export interface RfqUpdate {
    quote: Quote;
    status: string;
}

export interface RfqOperationAck {
    success: boolean;
}

export class RfqService {
    public requestQuote(request: RfqRequest): Rx.Observable<RfqUpdate> {
        return Rx.Observable.never();
    }

    public cancelRfq(request: CancelRfqRequest): Rx.Observable<RfqOperationAck> {
        return Rx.Observable.never();
    }

    public executeQuote(request: ExecuteOnQuoteRequest): Rx.Observable<RfqOperationAck> {
        return Rx.Observable.never();
    }
}