import {
    Logger
} from 'esp-js-ui';
import {TileEvents} from '../../events';
import {observeEvent} from 'esp-js';
import {ReferenceDataState} from '../cashTileModel';
import {RefDataService} from '../../services/refDataService';

const _log: Logger = Logger.create('CashTile-ReferenceDataStateHandlers');

export class ReferenceDataStateHandlers {

    constructor(private _refDataService: RefDataService, private _modelId: string) {
    }

    @observeEvent(TileEvents.bootstrap)
    onCurrencyPairsUpdated(draft: ReferenceDataState) {
        _log.info(`[${this._modelId}] Setting currency pairs`);
        draft.currencyPairs = this._refDataService.currencyPairs;
    }
}