import { InputEventStream, OutputEventStream } from 'esp-js-polimer';
import { CashTileModel } from '../cashTileModel';
import { InputEvents, RfqEvents } from '../../events';
import { RfqService } from '../../services/rfqService';
export declare class RequestForQuoteEventStreams {
    _rfqService: RfqService;
    constructor(_rfqService: RfqService);
    onRfqTypeEvent(inputEventStream: InputEventStream<CashTileModel, RfqEvents.RequestQuoteEvent | InputEvents.NotionalChanged | InputEvents.CurrencyPairChangedEvent>): OutputEventStream<RfqEvents.RfqUpdateEvent>;
    private _logQuoteDebug;
}
