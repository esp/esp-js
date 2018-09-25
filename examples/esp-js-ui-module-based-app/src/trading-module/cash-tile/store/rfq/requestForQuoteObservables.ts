import * as Rx from 'rx';
import {InputEvent, OutputEvent, eventTransformFor} from 'esp-js-polimer';
import {CashTileStore} from '../cashTileStore';
import {RfqEvents} from '../../events';
import {RfqRequest, RfqService} from '../../services/rfqService';
import {Logger} from '../../../../../../../packages/esp-js-ui';

const _log = Logger.create('CashTile-RequestForQuoteObservables');

export class RequestForQuoteObservables {
    constructor(public _rfqService: RfqService) {
    }

    @eventTransformFor(RfqEvents.requestQuote)
    onRequestQuote(inputEvent: InputEvent<RfqEvents.RequestQuoteEvent, CashTileStore>): Rx.Observable<OutputEvent<RfqEvents.RfqUpdateEvent>> {
        let request: RfqRequest = {
            rfqId: inputEvent.store.requestForQuote.rfqId,
            ccyPair: inputEvent.store.inputs.ccyPair,
            notional: inputEvent.store.inputs.notional
        };
        _log.debug(`onRequestQuote`, request);
        return this._rfqService.requestQuote(request)
            .map(response => ({
                eventType: RfqEvents.rfqUpdate,
                event: <RfqEvents.RfqUpdateEvent> {
                    rfqId: response.rfqId,
                    quote: response.quote,
                    status: response.status
                }
            }));
    }

    // TODO other events in RfqEvents
}