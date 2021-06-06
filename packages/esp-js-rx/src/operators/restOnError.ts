import {NEVER, Observable, Subscription} from 'rxjs';
import {Logger, utils} from 'esp-js';
import {catchError, filter, take} from 'rxjs/operators';
import {SerialDisposable} from '../disposables';

const _log = Logger.create('restOnError');

export interface ResetEnabledStreamItem<T> {
    /**
     * True if the stream is resetting, else false.
     */
    streamResetting: boolean;
    /**
     * The error which caused the stream to reset, will be null if `streamResetting` is false.
     */
    error?: Error;
    /**
     * The item procured through the stream, will be null if the `streamResetting` is true.
     */
    item?: T;
}

/**
 * Upon any error of source, restOnError will send a `ResettingStreamItem` upstream indicating the stream is resetting.
 * It will then subscribe to resubscribeSignal, upon that yielding a `true`, it will resubscribe to the source.
 *
 * This is a slightly cleaner retry mechanism to use when you don't want error flows to be uses for logic up stream.
 */
export function restOnError<T>(resubscribeSignal: Observable<boolean>, logTag: string, log: Logger = _log): (source: Observable<T>) => Observable<ResetEnabledStreamItem<T>> {
    return (source: Observable<T>) => new Observable<ResetEnabledStreamItem<T>>((subscriber) => {
        let subscription = new Subscription(),
            isDisposed = false,
            isCompleted = false,
            hasError = false,
            resubscribeDisposable = new SerialDisposable(),
            streamDisposable = new SerialDisposable(),
            subscribe: (isResubscribe: boolean) => void;
        subscription.add(streamDisposable);
        subscription.add(resubscribeDisposable);
        subscribe = (isResubscribe = false) => {
            // given we could try resubscribe via a timer callback, we need to ensure the stream is still value
            if (!isDisposed && !isCompleted && !hasError) {
                log.debug(`[restOnError-${logTag}]: ${isResubscribe ? 'Resubscribing' : 'Subscribing'}`);
                streamDisposable.setDisposable(source
                    .pipe(
                        catchError((err: any) => {
                            log.error(`[restOnError-${logTag}]: Error caught, issuing stream reset and will resubscribe on next signal. Error [${utils.getErrorText(err)}]`);
                            subscriber.next({item: null, streamResetting: true, error: err});
                            resubscribeDisposable.setDisposable(resubscribeSignal
                                .pipe(
                                    filter(b => b),
                                    take(1))
                                .subscribe(
                                    _ => subscribe(true),
                                    (err1: any) => {
                                        log.error(`[restOnError-${logTag}]: Terminal error on resubscribeSignal stream: [${utils.getErrorText(err1)}]`);
                                        subscriber.error(err1);
                                    },
                                )
                            );
                            streamDisposable.setDisposable(null);
                            // doesn't matter what re return here, we disposed above,
                            // we don't want to return EMPTY however as that'd trigger a complete upstream.
                            return NEVER;
                        })
                    )
                    .subscribe(
                        i => {
                            subscriber.next({item: i, streamResetting: false, error: null});
                        },
                        err => {
                            log.error(`[restOnError-${logTag}]: Terminal error on source stream: [${utils.getErrorText(err)}]`);
                            hasError = true;
                            subscriber.error(err);
                        },
                        () => {
                            log.verbose(`[restOnError-${logTag}]: Source stream complete`);
                            isCompleted = true;
                            subscriber.complete();
                        }
                    )
                );
            }
        };
        subscribe(false);
        return () => {
            isDisposed = true;
            subscription.unsubscribe();
        };
    });
}
