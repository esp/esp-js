import {Observable, Subject, Subscription} from 'rxjs';
import {ResetEnabledStreamItem, restOnError} from '../../src/operators/restOnError';

describe('.resetOnError()', () => {
    let _subject: Subject<number>,
        _resetStream: Subject<boolean>,
        _downstream,
        _received: ResetEnabledStreamItem<number>[],
        _throwIf,
        _errorToThrow,
        _receivedError,
        _subscribeCount: number,
        _completedCount: number,
        _subscription: Subscription;

    function setup() {
        _subject = new Subject<number>();
        _resetStream = new Subject<boolean>();
        _received = [];
        _throwIf = -1;
        _errorToThrow =  new Error('Boom!');
        _subscribeCount = 0;
        _completedCount = 0;
        _downstream = new Observable(o => {
            _subscribeCount++;
            _subject.subscribe(
                i => {
                    if (i === _throwIf) {
                        o.error(_errorToThrow);
                    } else {
                        o.next(i);
                    }
                }
            );
            return () => {
            };
        });
    }

    function subscribe() {
        _subscription = _downstream
            .pipe(
                restOnError(
                    _resetStream,
                    'test-stream'
                )
            )
            .subscribe(
                i => _received.push(i),
                err => _receivedError = err,
                () => _completedCount++
            );
    }

    const expectItem = (index: number, item: number, error: Error, streamResetting: boolean) => {
        const update: ResetEnabledStreamItem<number> = _received[index];
        expect(update.item).toEqual(item);
        expect(update.streamResetting).toEqual(streamResetting);
        expect(update.error).toEqual(error);
    };

    beforeEach(() => {
        setup();
    });

    it('propagates values through the stream', () => {
        subscribe();
        _subject.next(1);
        _subject.next(2);
        expectItem(0, 1, null, false);
        expectItem(1, 2, null, false);
    });

    it('raises reset notification on error', () => {
        subscribe();
        _subject.next(1);
        _subject.next(-1);
        expectItem(1, null, _errorToThrow, true);
    });

    it('retries after exception when signal stream yields true', () => {
        subscribe();

        _subject.next(1);
        expectItem(0, 1, null, false);

        _subject.next(-1);
        expectItem(1, null, _errorToThrow, true);
        expect(_subscribeCount).toEqual(1);

        _resetStream.next(false); // should be ignored
        expect(_received.length).toEqual(2);
        expect(_subscribeCount).toEqual(1);

        _subject.next(2); // should be ignored
        expect(_received.length).toEqual(2);
        expect(_subscribeCount).toEqual(1);

        _resetStream.next(true); // will trigger a resubscribe
        expect(_received.length).toEqual(2);
        expect(_subscribeCount).toEqual(2); // this should now bump

        _subject.next(3);
        expect(_received.length).toEqual(3);
        expectItem(2, 3, null, false);
    });

    it('propagates errors on reset stream ', () => {
        subscribe();
        _subject.next(-1);
        expectItem(0, null, _errorToThrow, true);
        expect(_received.length).toEqual(1);
        const error = new Error(`e1`);
        _resetStream.error(error); // will trigger a resubscribe
        expect(_receivedError).toBe(error);
        expect(_received.length).toEqual(1);
    });

    it('propagates complete on source stream ', () => {
        subscribe();
        _subject.complete();
        expect(_received.length).toEqual(0);
    });
});
