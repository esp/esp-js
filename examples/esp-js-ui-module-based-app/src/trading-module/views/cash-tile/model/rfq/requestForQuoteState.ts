import {
    Logger
} from 'esp-js-ui';
import {InputEvents, RfqEvents} from '../../events';
import * as uuid from 'uuid';
import {CashTileModel, RequestForQuoteState} from '../cashTileModel';
import {RfqStatus} from '../../../../services/rfqService';
import {observeEvent} from 'esp-js';

const _log = Logger.create('CashTile-RequestForQuoteState');

export class RequestForQuoteStateHandlers {

    constructor(/* can use DI if required for readonly access to other services */) {

    }

    @observeEvent(RfqEvents.requestQuote)
    onRequestQuote(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, model: CashTileModel /* , context: EventContext */) {
        _log.info(`Requesting Quote for ${model.inputs.ccyPair} ${model.inputs.notional}`);
        draft.rfqId = uuid.v4();
        draft.status = RfqStatus.Requesting;
    }

    @observeEvent(RfqEvents.rfqUpdate)
    onRfqUpdated(draft: RequestForQuoteState, event: RfqEvents.RfqUpdateEvent, model: CashTileModel /* , context: EventContext */) {
        _log.info(`Quote received. RfqId ${event.rfqId} price: ${event.quote.price}`, event);
        draft.status = event.status;
        draft.quote = event.quote;
    }

    @observeEvent(RfqEvents.cancelRfq)
    onCancelQuote(draft: RequestForQuoteState, event: RfqEvents.CancelRfqEvent, model: CashTileModel) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        draft.status = RfqStatus.Canceling;
        draft.quote = null;
    }

    @observeEvent(RfqEvents.executeOnQuote)
    onExecuting(draft: RequestForQuoteState, event: RfqEvents.ExecuteOnQuoteEvent, model: CashTileModel) {
        _log.info(`Passing on quote ${draft.rfqId}`, event);
        if (draft.status === RfqStatus.Quoting) {
            draft.status = RfqStatus.Executing;
        }
    }

    @observeEvent(InputEvents.changeCurrencyPair)
    @observeEvent(InputEvents.notionalChanged)
    onInputsChanged(draft: RequestForQuoteState, event: RfqEvents.RequestQuoteEvent, model: CashTileModel /* , context: EventContext */) {
        _log.info(`Requesting Quote for ${model.inputs.ccyPair} ${model.inputs.notional}`);
        draft.rfqId = null;
        draft.status = RfqStatus.Idle;
        draft.quote = null;
    }
}