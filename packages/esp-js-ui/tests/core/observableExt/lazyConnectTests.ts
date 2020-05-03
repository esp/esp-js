import {Subject, Subscription} from 'rxjs';
import {publish, tap} from 'rxjs/operators';
import {lazyConnect} from '../../../src/core/observableExt';

describe('lazyConnectTests', () => {
    // TBH this feels like dodgy functionality due to how it manages the subscription.
    // I'm leaving it here as it's existing code.
    // Really calling code should better manage the underling change from a hot to cold obs
    it('auto connects to observable upon subscribe', () => {
        let procureCount1 = 0;
        let procureCount2 = 0;
        let procureCount3 = 0;
        const subject = new Subject<number>();
        let  subscription: Subscription = null;

        let stream = subject.pipe(
            tap(() => { procureCount1++; }),
            publish(),
            lazyConnect(s => subscription = s)
        );

        subject.next(1); // gets lost
        expect(procureCount1).toEqual(0);

        stream.subscribe(i => {
            procureCount2++;
        });
        expect(procureCount2).toEqual(0);

        subject.next(2);

        stream.subscribe(i => {
            procureCount3++;
        });
        expect(procureCount3).toEqual(0);

        subject.next(3);

        subscription.unsubscribe();

        subject.next(4); // gets lost

        expect(procureCount1).toEqual(2);
        expect(procureCount2).toEqual(2);
        expect(procureCount3).toEqual(1);
    });
});