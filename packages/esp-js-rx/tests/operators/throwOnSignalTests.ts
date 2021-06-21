import {Observable, Subject} from 'rxjs';
import {throwOnSignal} from '../../src/operators';

describe('throwOnSignal', () => {
    let receivedItems: number[];
    let receivedError: Error;
    let subject: Subject<number>;
    let signal: Subject<string>;
    let hasCompleted = false;

    beforeEach(() => {
        receivedItems = [];
        receivedError = null;
        subject = new Subject<number>();
        signal = new Subject<string>();
        const xs: Observable<number> = subject.pipe(
            throwOnSignal(signal, thrownSignal => new Error(`throwOnSignal signal ${thrownSignal}`))
        );
        xs.subscribe(
            i => {
                receivedItems.push(i);
            },
            error => receivedError = error,
            () => hasCompleted = true
        );
    });

    it('throws on signal', () => {
        subject.next(1);
        subject.next(2);
        signal.next('do-throw');
        expect(receivedItems).toEqual([1,2]);
        expect(receivedError.message).toEqual('throwOnSignal signal do-throw');
    });

    it('propagates on completed', () => {
        subject.next(1);
        subject.complete();
        expect(receivedItems).toEqual([1]);
        expect(hasCompleted).toBeTruthy();
    });

    it('propagates on error', () => {
        subject.next(1);
        subject.error(new Error('throwOnSignal Boom'));
        expect(receivedItems).toEqual([1]);
        expect(receivedError.message).toEqual('throwOnSignal Boom');
    });
});