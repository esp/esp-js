import {utils} from '../utils';

export type  Disposable = {
    dispose (): void;
    readonly isDisposed?: boolean;
};

// Exists for rx compatibility with rxjs5, it's an exact match for our DisposableType above.
export type Subscription = {
    unsubscribe(): void;
    readonly closed: boolean;
};

export type DisposableOrFunction = Disposable | (() => void);

export type DisposableItem = Disposable | Subscription | (() => void);

export namespace DisposableUtil {
    export const isDisposable = (o: any): o is Disposable => {
        let isObject = typeof o === 'object' && o !== null;
        return isObject && 'dispose' in o && utils.isFunction(o.dispose);
    };

    export const isSubscription = (o: any): o is Disposable => {
        let isObject = typeof o === 'object' && o !== null;
        return isObject && 'unsubscribe' in o && utils.isFunction(o.unsubscribe);
    };
}