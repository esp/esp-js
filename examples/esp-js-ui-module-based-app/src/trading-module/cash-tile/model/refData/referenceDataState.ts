import {
    Logger
} from 'esp-js-ui';
import {ReferenceDataEvents} from '../../events';
import {observeEvent} from 'esp-js';
import {ReferenceDataState} from '../cashTileModel';

const _log = Logger.create('CashTile-ReferenceDataState');

export class ReferenceDataStateHandlers {
    @observeEvent(ReferenceDataEvents.currencyPairsUpdated)
    onCurrencyPairsUpdated(draft: ReferenceDataState, event: ReferenceDataEvents.CurrencyPairsUpdated) {
        _log.info(`Adding new currency pairs ${event.newPairs}`, event.newPairs);
        draft.currencyPairs = event.newPairs;
    }
}