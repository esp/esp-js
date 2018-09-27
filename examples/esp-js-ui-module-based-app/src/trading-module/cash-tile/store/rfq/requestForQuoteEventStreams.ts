import * as Rx from 'rx';
import {InputEvent, OutputEvent, eventTransformFor} from 'esp-js-polimer';
import {CashTileStore} from '../cashTileStore';
import {InputEvents, RfqEvents} from '../../events';
import {RfqRequest, RfqService} from '../../services/rfqService';
import {Logger} from '../../../../../../../packages/esp-js-ui';

const _log = Logger.create('CashTile-RequestForQuoteObservables');

export class RequestForQuoteEventStreams {
    constructor(public _rfqService: RfqService) {
    }

    @eventTransformFor(InputEvents.changeCurrencyPair)
    @eventTransformFor(InputEvents.notionalChanged)
    @eventTransformFor(RfqEvents.requestQuote)
    onRfqTypeEvent(inputEventStream: Rx.Observable<InputEvent<RfqEvents.RequestQuoteEvent | InputEvents.NotionalChanged | InputEvents.CurrencyPairChangedEvent, CashTileStore>>): Rx.Observable<OutputEvent<RfqEvents.RfqUpdateEvent>> {
        _log.debug('Wiring up rfq transform streams');
        return inputEventStream
            .map(inputEvent => {
                if (inputEvent.eventType === RfqEvents.requestQuote) {
                    let request: RfqRequest = {
                        rfqId: inputEvent.store.requestForQuote.rfqId,
                        ccyPair: inputEvent.store.inputs.ccyPair,
                        notional: inputEvent.store.inputs.notional
                    };
                    this._logQuoteDebug(request, 'Mapped input to RfqRequest');
                    return this._rfqService.requestQuote(request);
                } else {
                    return Rx.Observable.never();
                }
            })
            .switch()
            .map(response => {
                this._logQuoteDebug(response, 'Mapping RfqResponse to OutputEvent');
                return <OutputEvent<RfqEvents.RfqUpdateEvent>>{
                    eventType: RfqEvents.rfqUpdate,
                    event: <RfqEvents.RfqUpdateEvent> {
                        rfqId: response.rfqId,
                        quote: response.quote,
                        status: response.status
                    }
                };
            });
    }

    private _logQuoteDebug({rfqId, ccyPair, notional}, message) {
        _log.debug(`[${rfqId} ${ccyPair} ${notional}] - ${message}`);
    }
    // TODO other events in RfqEvents
}