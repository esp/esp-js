import {of} from 'rxjs';
import {doOnSubscribe} from '../../../src/core/observableExt';

describe('doOnSubscribeTests', () => {
    it('call provided action once on subscribe', () => {
        let callCount = 0;
        const subscription = of(1, 2, 3)
            .pipe(
                doOnSubscribe(() => {
                    callCount++;
                })
            )
            .subscribe(
                x => {

                }
            );
        subscription.unsubscribe();
        expect(callCount).toEqual(1);
    });
});