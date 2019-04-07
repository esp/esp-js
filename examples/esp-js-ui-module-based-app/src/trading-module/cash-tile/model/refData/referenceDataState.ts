import {PolimerHandlerMap} from 'esp-js-polimer';
import {
    Logger
} from 'esp-js-ui';
import {ReferenceDataEvents} from '../../events';
import {CashTileModel} from '../cashTileModel';

const _log = Logger.create('CashTile-ReferenceDataState');

export interface ReferenceDataState {
    currencyPairs: string[];
}

export const defaultReferenceDataStateFactory = (): ReferenceDataState => {
    return {
        currencyPairs: ['EURUSD', 'USDJPY', 'EURGBP']
    };
};

export const referenceDataStateHandlerMap: PolimerHandlerMap<ReferenceDataState, CashTileModel> = {
    [ReferenceDataEvents.currencyPairsUpdated]: (draft: ReferenceDataState, event: ReferenceDataEvents.CurrencyPairsUpdated) => {
        _log.info(`Adding new currenty pairs ${event.newPairs}`, event.newPairs);
        draft.currencyPairs = event.newPairs;
    }
};