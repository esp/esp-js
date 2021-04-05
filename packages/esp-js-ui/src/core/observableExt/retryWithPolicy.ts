import {NEVER, Observable, SchedulerLike, Subscription} from 'rxjs';
import {RetryPolicyLike} from './retryPolicy';
import {Logger} from 'esp-js';
import {async} from 'rxjs/internal/scheduler/async';
import {catchError} from 'rxjs/operators';

const _log = Logger.create('retryWithPolicy');

export function retryWithPolicy<T>(policy: RetryPolicyLike, error?: (err: Error) => void, scheduler?: SchedulerLike) : (source: Observable<T>) => Observable<T> {
    let _scheduler = scheduler || async;
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        let subscription: Subscription,
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
                subscription = source.pipe(
                    catchError(err => {
                        if (error) {
                            error(err);
                        }
                        policy.incrementRetryCount();
                        if (policy.shouldRetry) {
                            let retryLimitMessage = policy.retryLimit === -1 ? 'unlimited' : policy.retryLimit;
                            _log.error(`operation [${policy.description}] error: [${err}], scheduling retry after [${policy.retryAfterElapsedMs}]ms, this is attempt [${policy.retryCount}] of [${retryLimitMessage}]`);
                            isRetry = true;
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                            _scheduler.schedule(
                                subscribe,
                                policy.retryAfterElapsedMs,
                            );
                        } else {
                            subscriber.error(new Error(`Retry policy reached retry limit of [${policy.retryCount}]. Error: [${policy.errorMessage}], Exception: [${err}]`));
                        }
                        return NEVER;
                    }
                )).subscribe(
                    i => {
                        policy.reset();
                        subscriber.next(i);
                    },
                    err => {
                        hasError = true;
                        subscriber.error(err);
                    },
                    () => {
                        isCompleted = true;
                        subscriber.complete();
                    }
                );
            }
        };
        subscribe();
        return () => {
            isDisposed = true;
            subscription.unsubscribe();
        };
    });
}