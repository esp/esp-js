import {
    Logger
} from 'esp-js-ui';
import {TileEvents} from '../../events';
import {observeEvent} from 'esp-js';
import {ReferenceDataState} from '../cashTileModel';
import {CurrencyPairRefDataService} from '../../services/currencyPairRefDataService';

const _log: Logger = Logger.create('CashTile-ReferenceDataStateHandlers');

export class ReferenceDataStateHandlers {

    constructor(private _ccyPairRefDataService: CurrencyPairRefDataService, private _modelId: string) {
    }

    @observeEvent(TileEvents.bootstrap)
    onCurrencyPairsUpdated(draft: ReferenceDataState) {
        _log.info(`[${this._modelId}] Setting currency pairs`);
        draft.currencyPairs = this._ccyPairRefDataService.currencyPairs;
    }
}