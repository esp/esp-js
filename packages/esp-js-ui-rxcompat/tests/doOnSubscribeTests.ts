// need to import the library for side effects
import '../src';
import {Observable} from 'rxjs-compat';

describe('doOnSubscribeTests', () => {
    it('call provided action once on subscribe', () => {
        let callCount = 0;
        const subscription = Observable
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