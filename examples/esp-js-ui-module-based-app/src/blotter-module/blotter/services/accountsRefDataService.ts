import * as Rx from 'rx';
import {Logger} from 'esp-js-ui';
import {Unit} from 'esp-js-ui';

const _log = Logger.create('AccountsRefDataService');

export class AccountsRefDataService {
    private _accounts = [];
    public get accounts() {
        return this._accounts;
    }
    public loadAccounts(): Rx.Observable<Unit> {
        // Typically you'd have start protection, i.e. connect an obs, only call the backend once etc.
        // Omitting all that for simplicity.
        return Rx.Observable.create(o => {
            _log.debug(`Getting accounts pairs`);
            return Rx.Observable
                .timer(15_000) // simulate long latency
                .take(1)
                .subscribe(_ => {
                    _log.debug(`Accounts received`);
                    this._accounts = ['Barclays', 'HSBC', 'Lloyds Banking Group', 'NatWest Group', 'Standard Chartered'];
                    o.onNext(Unit.default);
                    o.onCompleted();
                });
        });
    }
}