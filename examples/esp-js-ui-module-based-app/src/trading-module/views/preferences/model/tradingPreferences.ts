import {viewBinding} from 'esp-js-react';
import {TradingPreferencesView} from '../views/tradingPreferencesView';
import {PreferencesEntity, PreferenceState} from '../../../../common';
import {observeEvent, Router} from 'esp-js';
import {CurrencyPairRefDataService} from '../../../services';
import {TradingPreferencesEvents} from './tradingPreferenceEvents';

@viewBinding(TradingPreferencesView)
export class TradingPreferences implements PreferencesEntity {
    private _defaultPair: string;

    constructor(private _currencyPairRefDataService: CurrencyPairRefDataService, private _modelId: string, private _router: Router) {
        this._defaultPair = _currencyPairRefDataService.currencyPairs[0];
    }

    public get name(): string {
        return 'Trading';
    }

    public get defaultPair(): string {
        return this._defaultPair;
    }

    public get pairs() {
        return this._currencyPairRefDataService.currencyPairs;
    }

    @observeEvent(TradingPreferencesEvents.defaultPairChanged)
    private _defaultPairChanged(e: TradingPreferencesEvents.DefaultPairChangedEvent) {
        this._defaultPair = e.pair;
    }

    getPreferenceState(): PreferenceState {
        // these would initially come from a persistent store, then be updated if the users changed them on the view.
        return {
            'trading-pref-default-pair': this._defaultPair,
        };
    }
}