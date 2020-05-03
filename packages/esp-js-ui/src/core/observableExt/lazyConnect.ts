import {Observable, Subscription, ConnectableObservable} from 'rxjs';

/**
 * This automatically connects the source connectable and give you a hook to store the subscription so it can be torn down at a specific time.
 * @param onConnect
 */
export function lazyConnect<T>(onConnect: (subscription: Subscription) => void) : (source: Observable<T>) => Observable<T> {
    let isConnected = false;
    return (source: ConnectableObservable<T>) => new Observable<T>((subscriber) => {
        let subscription = source.subscribe(subscriber);
        // Ensure we subscribe first before we connect to avoid any races
        if(!isConnected) {
            const sub = source.connect();
            isConnected = true;
            // delegate the management of the underlying subscription externally
            onConnect(sub);
        }
        return () => {
            subscription.unsubscribe();
        };
    });
}

// Compatibility layer:
export function lazyConnectCompat<T>(onConnect: (subscription: Subscription) => void): Observable<T> {
    return lazyConnect<T>(onConnect)(this);
}
// Note, this should really be on type ConnectableObservable but I can't seem to get that working.
(Observable as any).prototype.lazyConnect = lazyConnectCompat;
declare module 'rxjs/internal/observable' {
    interface Observable<T> {
        lazyConnect: typeof lazyConnectCompat;
    }
}