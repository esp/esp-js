import {InputEvent, OutputEvent, eventTransformFor, InputEventStream, OutputEventStream} from 'esp-js-polimer';
import {CashTileModel} from '../cashTileModel';
import {InputEvents, RfqEvents} from '../../events';
import {RfqRequest, RfqService, RfqUpdate} from '../../../../services/rfqService';
import {Logger} from 'esp-js-ui';
import {NEVER} from 'rxjs';
import {map, switchAll} from 'rxjs/operators';

const _log = Logger.create('CashTile-RequestForQuoteObservables');

export class RequestForQuoteEventStreams {
    constructor(public _rfqService: RfqService) {
    }

    @eventTransformFor(InputEvents.changeCurrencyPair)
    @eventTransformFor(InputEvents.notionalChanged)
    @eventTransformFor(RfqEvents.requestQuote)
    onRfqTypeEvent(inputEventStream: InputEventStream<CashTileModel, RfqEvents.RequestQuoteEvent | InputEvents.NotionalChanged | InputEvents.CurrencyPairChangedEvent>): OutputEventStream<RfqEvents.RfqUpdateEvent> {
        _log.debug('Wiring up rfq transform streams');
        return inputEventStream.pipe(
                map((inputEvent: InputEvent<CashTileModel, RfqEvents.RequestQuoteEvent | InputEvents.NotionalChanged | InputEvents.CurrencyPairChangedEvent>) => {
                    if (inputEvent.eventType === RfqEvents.requestQuote) {
                        let request: RfqRequest = {
                            rfqId: inputEvent.model.requestForQuote.rfqId,
                            ccyPair: inputEvent.model.inputs.ccyPair,
                            notional: inputEvent.model.inputs.notional
                        };
                        _log.debug(`[RFQ new Quote ${request.rfqId} ${request.ccyPair} ${request.notional}] - Mapped input to RfqRequest`);
                        return this._rfqService.requestQuote(request);
                    } else {
                        // else deals with updating the quote stream... but not in this demo
                        return NEVER;
                    }
                }),
                switchAll(),
                map((response: RfqUpdate) => {
                    _log.debug(`[RFQ new Quote ${response.rfqId} ] - Mapping RfqResponse to OutputEvent`);
                    return <OutputEvent<RfqEvents.RfqUpdateEvent>>{
                        eventType: RfqEvents.rfqUpdate,
                        event: <RfqEvents.RfqUpdateEvent> {
                            rfqId: response.rfqId,
                            quote: response.quote,
                            status: response.status
                        }
                    };
                })
            );
    }

    // TODO other events in RfqEvents
}