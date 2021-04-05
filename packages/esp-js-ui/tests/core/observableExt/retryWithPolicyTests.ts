import { TestScheduler } from 'rxjs/testing';
import { RetryPolicy } from '../../../src/core/observableExt';
import {Observable, Subject, Subscription} from 'rxjs';
import {retryWithPolicy} from '../../../src/core/observableExt/retryWithPolicy';

describe('.retryWithPolicy()', () => {
    let _subject:Subject<any>,
        _stream,
        _testScheduler:TestScheduler,
        _relievedValue,
        _throwIf,
        _policy,
        _onRetryErr,
        _err,
        _subscription: Subscription;

    beforeEach(() => {
        _subject = new Subject<any>();
        _relievedValue = 0;
        _throwIf = -1;
        jest.useFakeTimers();
        _policy = new RetryPolicy('TestOperation', 2, 1000, 'An Error');
        _stream = new Observable(o => {
            _subject.subscribe(
                i => {
                    if(i ===  _throwIf) {
                        o.error(new Error('Boom!'));
                    } else {
                        o.next(i);
                    }
                }
            );
            return () => {};
        });

    });

    function subscribe() {
        _subscription = _stream
            .pipe(
                retryWithPolicy(
                    _policy, err => {
                        _onRetryErr = err;
                    },
                    _testScheduler
                )
            )
            .subscribe(
                i => _relievedValue = i,
                err => _err = err
        );
    }

    it('propagates values through the stream', () => {
        subscribe();
        _subject.next(1);
        expect(_relievedValue).toEqual(1);
    });

    it('retries after exception', () => {
        subscribe();
        _subject.next(1);
        expect(_relievedValue).toEqual(1);
        _subject.next(-1);
        expect(_policy.retryCount).toEqual(1);
        jest.advanceTimersByTime(1001);
        _subject.next(2);
        expect(_relievedValue).toEqual(2);
    });

    it('calls onError on exception', () => {
        subscribe();
        _subject.next(-1);
        expect(_onRetryErr).toEqual(new Error('Boom!'));
    });

    it('resets retry count after successful propagation', () => {
        subscribe();
        _subject.next(-1);
        expect(_policy.retryCount).toEqual(1);
        jest.advanceTimersByTime(1001);
        _subject.next(1);
        expect(_policy.retryCount).toEqual(0);
    });

    it('propagates the exception after retry count limit reached', () => {
        subscribe();
        _subject.next(-1);
        jest.advanceTimersByTime(1001);
        _subject.next(-1);
        expect(_err).toBeDefined();
    });

    it('should dispose internal subscription after stream disposed', () => {
        _subscription.unsubscribe();
        _subject.next(-1);
        expect(_policy.retryCount).toEqual(0);
    });

    it('should not resubscribe if retryafter callback happens after disposal occurred', () => {
        subscribe();
        _subject.next(-1);
        _subscription.unsubscribe();
        jest.advanceTimersByTime(1001);
        expect(_policy.retryCount).toEqual(1);
    });

    it('should not retry with the none retry policy', () => {
        _policy = RetryPolicy.none();
        subscribe();
        _subject.next(-1);
        expect(_err).toBeDefined();
    });

    it('should retry unlimited when retry count is below 0', () => {
        let doError = () => {
            _subject.next(-1);
            jest.advanceTimersByTime(1001);
        };
        _policy = RetryPolicy.createForUnlimitedRetry('ATest', 1000);
        subscribe();
        doError();
        doError();
        doError();
        expect(_policy.retryCount).toEqual(3);
        _subject.next(1);
        expect(_relievedValue).toEqual(1);
    });
});
