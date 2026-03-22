import {Disposable} from '../system/disposables';

/**
 * Minimal public subscription interface returned by Router.getModelObservable().
 * Consumers call .subscribe() to receive model snapshots — the underlying
 * implementation is the internal Observable, which satisfies this interface
 * structurally.
 */
export interface Subscribable<T> {
    subscribe(onNext: (item: T) => void): Disposable;
    subscribe(onNext: (item: T) => void, onCompleted: () => void): Disposable;
}
