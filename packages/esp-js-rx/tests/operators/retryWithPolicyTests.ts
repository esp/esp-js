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
            _policy = new RetryPolicy('TestOperation', 1000, 2, () => 'An Error');
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
            _policy = RetryPolicy.none('SomeOperation');
            subscribe();
            _subject.next(-1);
            expect(_err).toBeDefined();
            expect(_err.message).toContain(`Retry policy [SomeOperation] will not retry. Policy error: [Message: Boom!, Stack: Error: Boom!`);
        });

        test.each([
            [null],
            [-1],
        ])('should retry unlimited when retry limit is %s', (retryLimit) => {
            let doError = () => {
                _subject.next(-1);
                _testScheduler.advanceTime(1001);
            };
            _policy = new RetryPolicy('TestOperation', 1000, retryLimit, () => 'An Error');
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

    describe('RetryPolicy Error Messages', () => {

        it('errorMessageFactory sets error message', () => {
            const factory = (err) => `The Factory ${err.message}`;
            _policy = new RetryPolicy('TestOperation', 1000, 2, factory);
            setup();
            subscribe();
            _subject.next(-1);
            expect(_policy.errorMessage).toEqual('The Factory Boom!');
        });

        it('errorMessageFactory can be null', () => {
            _policy = new RetryPolicy('TestOperation', 1000, 2, null);
            setup();
            subscribe();
            _subject.next(-1);
            expect(_policy.errorMessage).toContain('Message: Boom!, Stack: Error: Boom!');
        });
    });

    describe('Backwards Compatability', () => {

        const policyFactory: (isOldApi: boolean) => RetryPolicyLike & {incrementRetryCallCount: number, onErrorCallCount: number, errorPassed: boolean} = (isOldApi: boolean) => {
            let policy = {
                description: '',
                errorMessage: '',
                lastError: undefined,
                retryAfterElapsedMs: 0,
                retryCount: 0,
                retryLimit: 0,
                shouldRetry: false,
                incrementRetryCallCount: 0,
                onErrorCallCount: 0,
                errorPassed: false,
                incrementRetryCount(error?: any): void {
                    this.incrementRetryCallCount++;
                    this.errorPassed = !!error;
                },
                onError(error?: any): void {
                    this.onErrorCallCount++;
                    this.errorPassed = !!error;
                },
                reset(): void {}
            };
            if (isOldApi) {
                policy.onError = undefined;
            } else {
                policy.incrementRetryCount = undefined;
            }
            return policy;
        };

        it('oldApi calls incrementRetryCount and passes error', () => {
            let policy = policyFactory(true);
            _policy = policy;
            setup();
            subscribe();
            _subject.next(-1);
            expect(policy.incrementRetryCallCount).toEqual(1);
            expect(policy.onErrorCallCount).toEqual(0);
            expect(policy.errorPassed).toBeTruthy();
        });

        it('new API calls onError and passes error', () => {
            let policy = policyFactory(false);
            _policy = policy;
            setup();
            subscribe();
            _subject.next(-1);
            expect(policy.incrementRetryCallCount).toEqual(0);
            expect(policy.onErrorCallCount).toEqual(1);
            expect(policy.errorPassed).toBeTruthy();
        });
    });

    describe('Constant Back Off', () => {
        it('retries on a constant backoff curve', () => {
            _policy = RetryPolicy.retry('TestOperation', 10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
        });

        it('respect limit', () => {
            _policy = RetryPolicy.retry('TestOperation', 10_000, 2);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.shouldRetry).toBeFalsy();
        });
    });

    describe('Linear Back Off', () => {
        beforeEach(() => {
            _policy = RetryPolicy.retryWithLinearBackOff('TestOperation', 10_000, 60_000);
        });

        it('retries on a linear backoff curve', () => {
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(20_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(30_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(40_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(50_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(60_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(60_000);
        });

        it('respect limit', () => {
            _policy = RetryPolicy.retryWithLinearBackOff('TestOperation', 10_000, 60_000, 2);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(20_000);
            _policy.onError();
            expect(_policy.shouldRetry).toBeFalsy();
        });
    });

    describe('Exponential Back Off', () => {
        it('retries on a backoff curve', () => {
            _policy = RetryPolicy.retryWithExponentialBackOff('TestOperation', 10_000);
            // expected retries
            // 1, 2, 3, 4, 7, 10, 10, 10,
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(1000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(2000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(3000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(4000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(7000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
            _policy.onError();
            expect(_policy.retryAfterElapsedMs).toEqual(10_000);
        });

        it('respects retry limit', () => {
            _policy = new ExponentialBackOffRetryPolicy('TestOperation', 0.5, 10_000, 3);
            expect(_policy.shouldRetry).toBeTruthy();
            _policy.onError();
            _policy.onError();
            expect(_policy.shouldRetry).toBeTruthy();
            _policy.onError();
            expect(_policy.shouldRetry).toBeFalsy();
        });
    });
});
