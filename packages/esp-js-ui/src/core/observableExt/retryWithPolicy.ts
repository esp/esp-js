import * as Rx from 'rx';
import {Logger} from '../logger';
import {RetryPolicy} from './retryPolicy';

const _log = Logger.create('retryWithPolicy');

Rx.Observable.prototype.retryWithPolicy = function<T>(policy: RetryPolicy, onError?: (err: Error) => void, scheduler?: Rx.IScheduler): Rx.Observable<T>  {
    let _scheduler = scheduler || Rx.Scheduler.default;
    let _source = this;
    return Rx.Observable.create<T>(
        o => {
            let disposable = new Rx.SerialDisposable(),
                isDisposed = false,
                isCompleted = false,
                hasError = false,
                subscribe,
                isRetry = false;
            subscribe = () => {
                // given we could try resubscribe via a timer callback, we need to ensure the stream is still value
                if (!isDisposed && !isCompleted && !hasError) {
                    if (isRetry) {
                        _log.debug(`operation [${policy.description}] retrying`);
                    }
                    disposable = _source.catch(err => {
                        if (onError) {
                            onError(err);
                        }
                        policy.incrementRetryCount();
                        if (policy.shouldRetry) {
                            let retryLimitMessage = policy.retryLimit === -1 ? 'unlimited' : policy.retryLimit;
                            _log.error(`operation [${policy.description}] error: [${err}], scheduling retry after [${policy.retryAfterElapsedMs}]ms, this is attempt [${policy.retryCount}] of [${retryLimitMessage}]`);
                            isRetry = true;
                            // _scheduler.scheduleWithRelative(policy.retryAfterElapsedMs, subscribe);
                            _scheduler.scheduleFuture(
                                '',
                                policy.retryAfterElapsedMs,
                                subscribe
                            );
                        } else {
                            o.onError(new Error(`Retry policy reached retry limit of [${policy.retryCount}]. Error: [${policy.errorMessage}], Exception: [${err}]`));
                        }
                        return Rx.Observable.never();
                    }).subscribe(
                        i => {
                            policy.reset();
                            o.onNext(i);
                        },
                        err => {
                            hasError = true;
                            o.onError(err);
                        },
                        () => {
                            isCompleted = true;
                            o.onCompleted();
                        }
                    );
                }
            };
            subscribe();
            return () => {
                isDisposed = true;
                disposable.dispose();
            };
        }
    );
};