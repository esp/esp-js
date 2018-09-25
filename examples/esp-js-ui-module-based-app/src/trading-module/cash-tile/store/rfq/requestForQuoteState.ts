import {observeStateEvent, PolimerHandlerMap, CompositePolimerHandler, FunctionPolimerHandler} from 'esp-js-polimer';
import {
    Logger
} from 'esp-js-ui';
import {RfqEvents} from '../../events';
import * as uuid from 'uuid';
import {CashTileStore} from '../cashTileStore';

const _log = Logger.create('CashTile-RequestForQuoteState');

export enum RfqStatus {
    Idle = 'Idle',
    Requesting = 'Requesting',
    Quoting = 'Quoting',
    Canceling = 'Canceling',
    Executing = 'Executing',
    Executed = 'Executed',
    Canceled = 'Canceled'
}

export interface RequestForQuoteState {
    rfqId: string;
    currentQuoteId?: string;
    status: RfqStatus;
}

export const defaultRequestForQuoteStateFactory = (): RequestForQuoteState => {
    return {
        rfqId: null,
        currentQuoteId: null,
        status: RfqStatus.Idle
    };
};

export class RequestForQuoteStateHandlers {
    // a new decorator that will wire up the handler correctly
    @observeStateEvent(RfqEvents.requestQuote)
    onRequestQuote(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, store: CashTileStore /* , context: EventContext */) {
        _log.info(`Adding to region ${event.currencyPair} ${event.notional}`, event);
        draft.rfqId = uuid.v4();
        draft.status = RfqStatus.Requesting;
    }

    @observeStateEvent(RfqEvents.cancelRfq)
    onCancelQuote(draft: RequestForQuoteState, event: RfqEvents.CancelRfqEvent, store: CashTileStore) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        draft.status = RfqStatus.Canceling;
    }

    @observeStateEvent(RfqEvents.executeOnQuote)
    onExecuting(draft: RequestForQuoteState, event: RfqEvents.ExecuteOnQuoteEvent, store: CashTileStore) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        if (draft.status === RfqStatus.Quoting) {
            draft.status = RfqStatus.Executing;
        }
    }
}