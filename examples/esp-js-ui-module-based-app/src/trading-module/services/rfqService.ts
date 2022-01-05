import {Logger} from 'esp-js-ui';
import {NEVER, Observable, timer} from 'rxjs';
import {finalize, map} from 'rxjs/operators';

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
    public requestQuote(request: RfqRequest): Observable<RfqUpdate> {
        this._logQuoteDebug(request, `Quote request received for`);
        return timer(2000, 2000).pipe(
            map<number, RfqUpdate>((i: number) => {
                const update = {
                    rfqId: request.rfqId,
                    status: RfqStatus.Quoting,
                    quote: {
                        quoteId: i.toString(),
                        price: Number((1.2345 + i / 10000).toFixed(4))
                    }
                };
                this._logQuoteDebug(request, `Yielding new quote. Price: ${update.quote.price}`);
                return update;
            }),
            finalize(() => this._logQuoteDebug(request, `Quote stream completed`))
        );
    }

    private _logQuoteDebug({rfqId, ccyPair, notional}  : RfqRequest, message) {
        _log.debug(`[RFQ ${rfqId} ${ccyPair} ${notional}] - ${message}`);
    }

    public cancelRfq(request: CancelRfqRequest): Observable<RfqOperationAck> {
        return NEVER;
    }

    public executeQuote(request: ExecuteOnQuoteRequest): Observable<RfqOperationAck> {
        return NEVER;
    }
}