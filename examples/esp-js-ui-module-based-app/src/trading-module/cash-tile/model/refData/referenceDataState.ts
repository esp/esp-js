import {
    Logger
} from 'esp-js-ui';
import {ReferenceDataEvents} from '../../events';
import {observeEvent} from 'esp-js';

const _log = Logger.create('CashTile-ReferenceDataState');

export interface ReferenceDataState {
    currencyPairs: string[];
}

export const defaultReferenceDataStateFactory = (): ReferenceDataState => {
    return {
        currencyPairs: ['EURUSD', 'USDJPY', 'EURGBP']
    };
};

export class ReferenceDataStateHandlers {
    @observeEvent(ReferenceDataEvents.currencyPairsUpdated)
    onCurrencyPairsUpdated(draft: ReferenceDataState, event: ReferenceDataEvents.CurrencyPairsUpdated) {
        _log.info(`Adding new currency pairs ${event.newPairs}`, event.newPairs);
        draft.currencyPairs = event.newPairs;
    }
}