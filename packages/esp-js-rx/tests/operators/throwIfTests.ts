import {Subject} from 'rxjs';
import {throwIf} from '../../src/operators';

describe('throwIf', () => {
    let receivedItems: number[];
    let receivedError: Error;
    let subject: Subject<number>;
    let hasCompleted = false;

    beforeEach(() => {
        receivedItems = [];
        receivedError = null;
        subject = new Subject<number>();
        const xs = subject.pipe(
            throwIf(item => item > 2, item => new Error(`throwIf item ${item}`))
        );
        xs.subscribe(
            i => {
                receivedItems.push(i);
            },
            error => receivedError = error,
            () => hasCompleted = true
        );
    });

    it('throws on condition', () => {
        subject.next(1);
        subject.next(2);
        subject.next(3);
        expect(receivedItems).toEqual([1,2]);
        expect(receivedError.message).toEqual('throwIf item 3');
    });

    it('propagates on completed', () => {
        subject.next(1);
        subject.complete();
        expect(receivedItems).toEqual([1]);
        expect(hasCompleted).toBeTruthy();
    });

    it('propagates on error', () => {
        subject.next(1);
        subject.error(new Error('throwIf Boom'));
        expect(receivedItems).toEqual([1]);
        expect(receivedError.message).toEqual('throwIf Boom');
    });
});