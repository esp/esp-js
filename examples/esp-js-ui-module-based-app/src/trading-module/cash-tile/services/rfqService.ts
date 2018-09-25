import * as Rx from 'rx';
import {Logger} from 'esp-js-ui';

export enum RfqStatus {
    Idle = 'Idle',
    Requesting = 'Requesting',
    Quoting = 'Quoting',
    Canceling = 'Canceling',
    Executing = 'Executing',
    Executed = 'Executed',
    Canceled = 'Canceled'
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

const _log = Logger.create('RfqService');

export class RfqService {
    public requestQuote(request: RfqRequest): Rx.Observable<RfqUpdate> {
        _log.debug(`Quote Request received`, request);
        return Rx.Observable.timer(2000, 2000).map<RfqUpdate>(i => {
            const update = {
                rfqId: request.rfqId,
                status: RfqStatus.Quoting,
                quote: {
                    quoteId: i.toString(),
                    price: (1.2345 + i / 10000).toFixed(5)
                }
            };
            _log.debug(`Mapping quote update`, update);
            return update;
        });
    }

    public cancelRfq(request: CancelRfqRequest): Rx.Observable<RfqOperationAck> {
        return Rx.Observable.never();
    }

    public executeQuote(request: ExecuteOnQuoteRequest): Rx.Observable<RfqOperationAck> {
        return Rx.Observable.never();
    }
}