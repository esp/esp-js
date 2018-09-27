import {stateHandlerFor} from 'esp-js-polimer';
import {
    Logger
} from 'esp-js-ui';
import {InputEvents, RfqEvents} from '../../events';
import * as uuid from 'uuid';
import {CashTileStore} from '../cashTileStore';
import {Quote, RfqStatus} from '../../services/rfqService';

const _log = Logger.create('CashTile-RequestForQuoteState');

export interface RequestForQuoteState {
    rfqId: string;
    currentQuoteId?: string;
    status: RfqStatus;
    quote?: Quote;
}

export const defaultRequestForQuoteStateFactory = (): RequestForQuoteState => {
    return {
        rfqId: null,
        currentQuoteId: null,
        status: RfqStatus.Idle
    };
};

export class RequestForQuoteStateHandlers {

    constructor(/* can use DI if required for readonly access to other services */) {

    }

    @stateHandlerFor(RfqEvents.requestQuote)
    onRequestQuote(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, store: CashTileStore /* , context: EventContext */) {
        _log.info(`Requesting Quote for ${store.inputs.ccyPair} ${store.inputs.notional}`);
        draft.rfqId = uuid.v4();
        draft.status = RfqStatus.Requesting;
    }

    @stateHandlerFor(RfqEvents.rfqUpdate)
    onRfqUpdated(draft: RequestForQuoteState, event: RfqEvents.RfqUpdateEvent, store: CashTileStore /* , context: EventContext */) {
        _log.info(`Quote received. RfqId ${event.rfqId} price: ${event.quote.price}`, event);
        draft.status = event.status;
        draft.quote = event.quote;
    }

    @stateHandlerFor(RfqEvents.cancelRfq)
    onCancelQuote(draft: RequestForQuoteState, event: RfqEvents.CancelRfqEvent, store: CashTileStore) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        draft.status = RfqStatus.Canceling;
        draft.quote = null;
    }

    @stateHandlerFor(RfqEvents.executeOnQuote)
    onExecuting(draft: RequestForQuoteState, event: RfqEvents.ExecuteOnQuoteEvent, store: CashTileStore) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        if (draft.status === RfqStatus.Quoting) {
            draft.status = RfqStatus.Executing;
        }
    }

    @stateHandlerFor(InputEvents.changeCurrencyPair)
    @stateHandlerFor(InputEvents.notionalChanged)
    onInputsChanged(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, store: CashTileStore /* , context: EventContext */) {
        _log.info(`Requesting Quote for ${store.inputs.ccyPair} ${store.inputs.notional}`);
        draft.rfqId = null;
        draft.status = RfqStatus.Idle;
        draft.quote = null;
    }
}