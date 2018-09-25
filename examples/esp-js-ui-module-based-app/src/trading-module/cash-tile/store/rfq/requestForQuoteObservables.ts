import * as Rx from 'rx';
import {EspUiEvents} from 'esp-js-ui';
import {InputEvent, OutputEvent, observeEventStream} from 'esp-js-polimer';
import {CashTileStore} from '../cashTileStore';
import {RfqEvents} from '../../events';
import {RfqService} from '../../services/rfqService';

export class RequestForQuoteObservables {
    constructor(public _rfqService: RfqService) {
    }

    // the contract requires it must return a transformed event stream
    @observeEventStream(RfqEvents.requestQuote)
    onRequestQuote(eventStream: Rx.Observable<InputEvent<RfqEvents.RequestQuoteEvent, CashTileStore>>): Rx.Observable<OutputEvent<EspUiEvents.AddToRegionEvent>> {
        return eventStream
            .map(data => this._rfqService.requestQuote({rfqId: data.store.requestForQuote.rfqId}))
            .switch()
            .map(response => ({
                eventType: RfqEvents.rfqUpdate,
                event: <RfqEvents.RfqUpdateEvent> {
                    quote: response.quote,
                    status: response.status
                }
            }));
    }

    // TODO other events in RfqEvents
}