import * as Rx from 'rxjs-compat';

// need to import the library for side effects
import '../src';

describe('doOnSubscribeTests', () => {
    it('call provided action once on subscribe', () => {
        let callCount = 0;
        const subscription = Rx.Observable
            .of(1, 2, 3)
            .doOnSubscribe(() => {
                callCount++;
            })
            .subscribe(
                x => {
                }
            );
        subscription.unsubscribe();
        expect(callCount).toEqual(1);
    });
});