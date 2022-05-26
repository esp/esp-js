import {NEVER, Observable, SchedulerLike, Subscription} from 'rxjs';
import {RetryPolicyLike} from './retryPolicy';
import {Logger, utils} from 'esp-js';
import {asyncScheduler} from 'rxjs/internal/scheduler/async';
import {catchError} from 'rxjs/operators';

const _log = Logger.create('retryWithPolicy');

export function retryWithPolicy<T>(policy: RetryPolicyLike, errorOrScheduler?: ((err: Error) => void) | SchedulerLike) : (source: Observable<T>) => Observable<T>;
export function retryWithPolicy<T>(policy: RetryPolicyLike, error?: (err: Error) => void, scheduler?: SchedulerLike) : (source: Observable<T>) => Observable<T>;
export function retryWithPolicy<T>(...args: any[]) : (source: Observable<T>) => Observable<T> {
    const policy: RetryPolicyLike = args[0];
    let error: (err: Error) => void = null;
    let scheduler: SchedulerLike;
    if (args.length === 2) {
        if (utils.isFunction(args[1])) {
            error = args[1];
        } else {
            scheduler = args[1];
        }
    } else if (args.length === 3) {
        error = args[1];
        scheduler = args[2];
    }
    scheduler = scheduler || asyncScheduler;
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        let subscription: Subscription,
            isDisposed = false,
            isCompleted = false,
            hasError = false,
            subscribe,
            isRetry = false;
        subscribe = () => {
            // given we could try re-subscribe via a timer callback, we need to ensure the stream is still value
            if (!isDisposed && !isCompleted && !hasError) {
                if (isRetry) {
                    _log.debug(`operation [${policy.description}] retrying`);
                }
                subscription = source.pipe(
                    catchError(err => {
                        if (error) {
                            error(err);
                        }
                        // For backwards compatability (specifically for micro front ends where esp APIs may be dynamically loaded into the DOM), we need first try the old method, else the new one
                        if (policy.incrementRetryCount) {
                            policy.incrementRetryCount(err);
                        } else {
                            policy.onError(err);
                        }
                        if (policy.shouldRetry) {
                            let retryLimitMessage = policy.retryLimit === -1 ? 'unlimited' : policy.retryLimit;
                            _log.error(`operation [${policy.description}] errored, scheduling retry after [${policy.retryAfterElapsedMs}]ms, this is attempt [${policy.retryCount}] of [${retryLimitMessage}]. Error: ${utils.getErrorText(err)}`);
                            isRetry = true;
                            if (subscription) {
                                subscription.unsubscribe();
                            }
                            scheduler.schedule(
                                subscribe,
                                policy.retryAfterElapsedMs,
                            );
                        } else {
                            subscriber.error(new Error(`Retry policy [${policy.description}] will not retry. Policy error: [${policy.errorMessage}]`));
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