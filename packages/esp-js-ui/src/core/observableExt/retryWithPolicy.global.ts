import * as Rx from 'rxjs';
import {RetryPolicy} from './retryPolicy';
import {Subscriber} from 'rxjs/src/Subscriber';
import { IScheduler } from 'rxjs/Scheduler';
import {Logger} from 'esp-js';

const _log = Logger.create('retryWithPolicy');

Rx.Observable.prototype.retryWithPolicy = function<T>(policy: RetryPolicy, error?: (err: Error) => void, scheduler?: IScheduler): Rx.Observable<T>  {
    let _scheduler = scheduler || Rx.Scheduler.async;
    let _source = this;
    return Rx.Observable.create(
        (o: Subscriber<T>) => {
            let subscription = new Rx.Subscription,
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
                    subscription = _source.catch(err => {
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
                            o.error(new Error(`Retry policy reached retry limit of [${policy.retryCount}]. Error: [${policy.errorMessage}], Exception: [${err}]`));
                        }
                        return Rx.Observable.never();
                    }).subscribe(
                        i => {
                            policy.reset();
                            o.next(i);
                        },
                        err => {
                            hasError = true;
                            o.error(err);
                        },
                        () => {
                            isCompleted = true;
                            o.complete();
                        }
                    );
                }
            };
            subscribe();
            return () => {
                isDisposed = true;
                subscription.unsubscribe();
            };
        }
    );
};