import * as Rx from 'rxjs';
import {Logger} from 'esp-js-ui';
import {Unit} from 'esp-js-ui';
import {Observable, timer} from 'rxjs';
import {take} from 'rxjs/operators';

const _log = Logger.create('CurrencyPairRefDataService');

export class CurrencyPairRefDataService {
    private _currencyPairs = [];
    public get currencyPairs() {
        return this._currencyPairs;
    }

    public loadCurrencyPairs(): Rx.Observable<Unit> {
        // Typically you'd have start protection, i.e. connect an obs, only call the backend once etc.
        // Omitting all that for simplicity.
        return new Observable(o => {
            _log.debug(`Getting currency pairs`);
            return  timer(2000).pipe(
                take(1)
            )
                .subscribe(_ => {
                    _log.debug(`Currency pairs received`);
                    this._currencyPairs = ['EURUSD', 'EURGBP', 'AUDUSD', 'CADJPY', 'EURCAD', 'USDBRL'];
                    o.next(Unit.default);
                    o.complete();
                });
        });
    }
}