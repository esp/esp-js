import * as Rx from 'rx';
import {Logger} from 'esp-js-ui';
import {Unit} from 'esp-js-ui';

const _log = Logger.create('CurrencyPairRefDataService');

export class CurrencyPairRefDataService {
    private _currencyPairs = [];
    public get currencyPairs() {
        return this._currencyPairs;
    }
    public loadCurrencyPairs(): Rx.Observable<Unit> {
        // Typically you'd have start protection, i.e. connect an obs, only call the backend once etc.
        // Omitting all that for simplicity.
        return Rx.Observable.create(o => {
            _log.debug(`Getting currency pairs`);
            return Rx.Observable
                .timer(2000) // simulate latency
                .take(1)
                .subscribe(_ => {
                    _log.debug(`Currency pairs received`);
                    this._currencyPairs = ['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY', 'EURCAD', 'USDBRL'];
                    o.onNext(Unit.default);
                    o.onCompleted();
                });
        });
    }
}