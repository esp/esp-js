import {Observable, Subject, Subscription} from 'rxjs';
import {retryWithPolicy, RetryPolicy, ExponentialBackOffRetryPolicy, RetryPolicyLike} from '../../src/operators';
import {ManualTestScheduler} from '../../src/schedulers';

describe('.retryWithPolicy()', () => {
    let _subject:Subject<any>,
        _stream,
        _testScheduler: ManualTestScheduler,
        _relievedValue,
        _throwIf,
        _policy: RetryPolicyLike,
        _onRetryErr,
        _err,
        _subscription: Subscription;

    function setup() {
        _subject = new Subject<any>();
        _relievedValue = 0;
        _throwIf = -1;
        _testScheduler = new ManualTestScheduler();
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
    }

    function subscribe() {
        _subscription = _stream
            .pipe(
                retryWithPolicy(
                    _policy,
                    err => {
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

    function subscribeWithoutErrorCallback() {
        _subscription = _stream
            .pipe(
                retryWithPolicy(_policy, _testScheduler)
            )
            .subscribe(
                i => _relievedValue = i,
                err => _err = err
            );
    }

    describe('RetryPolicy', () => {

        beforeEach(() => {
            _policy = new RetryPolicy('TestOperation', 2, 1000, 'An Error');
            setup();
        });

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
            _testScheduler.advanceTime(1001);
            _subject.next(2);
            expect(_relievedValue).toEqual(2);
        });

        it('calls onError on exception', () => {
            subscribe();
            _subject.next(-1);
            expect(_onRetryErr).toEqual(new Error('Boom!'));
        });

        it('error passed to retry policy', () => {
            subscribe();
            _subject.next(-1);
            expect(_policy.lastError).toEqual(new Error('Boom!'));
        });

        it('resets retry count after successful propagation', () => {
            subscribe();
            _subject.next(-1);
            expect(_policy.retryCount).toEqual(1);
            _testScheduler.advanceTime(1001);
            _subject.next(1);
            expect(_policy.retryCount).toEqual(0);
        });

        it('resets error after successful propagation', () => {
            subscribe();
            _subject.next(-1);
            expect(_policy.lastError).toBeDefined();
            _testScheduler.advanceTime(1001);
            _subject.next(1);
            expect(_policy.lastError).toBeNull();
        });

        it('propagates the exception after retry count limit reached', () => {
            subscribe();
            _subject.next(-1);
            _testScheduler.advanceTime(1001);
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
            _testScheduler.advanceTime(1001);
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
                _testScheduler.advanceTime(1001);
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

        it('can omit error handler', () => {
            subscribeWithoutErrorCallback();
            _subject.next(1);
            expect(_relievedValue).toEqual(1);
            _subject.next(-1);
            expect(_policy.retryCount).toEqual(1);
            _testScheduler.advanceTime(1001);
            _subject.next(2);
            expect(_relievedValue).toEqual(2);
        });
    });

    describe('ExponentialBackOffRetryPolicy', () => {
        beforeEach(() => {
            _policy = ExponentialBackOffRetryPolicy.defaultPolicy('TestOperation', 'Error');
        });

        it('retries on a backoff curve', () => {
            // expected retries
            // 1, 2, 3, 4, 7, 10, 10, 10,
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(1000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(2000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(3000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(4000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(7000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
        });

        it('resets after error', () => {
            _policy.incrementRetryCount();
            _policy.incrementRetryCount();
            _policy.incrementRetryCount();
            _policy.incrementRetryCount(new Error());
            expect(_policy.retryAfterElapsedMs).toEqual(4000);
            expect(_policy.lastError).toBeDefined();
            _policy.reset();
            expect(_policy.lastError).toBeNull();
            _policy.incrementRetryCount();
            expect(_policy.retryAfterElapsedMs).toEqual(1000);
        });

        it('respects retry limit', () => {
            _policy = new ExponentialBackOffRetryPolicy('TestOperation', 'Error', 3, 0.5, 10_000);
            expect(_policy.shouldRetry).toBeTruthy();
            _policy.incrementRetryCount();
            _policy.incrementRetryCount();
            expect(_policy.shouldRetry).toBeTruthy();
            _policy.incrementRetryCount();
            expect(_policy.shouldRetry).toBeFalsy();
        });
    });
});
