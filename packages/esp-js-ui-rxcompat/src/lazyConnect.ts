import {Observable, Subscription, ConnectableObservable} from 'rxjs';
import {lazyConnect} from 'esp-js-ui';

export function lazyConnectCompat<T>(onConnect: (subscription: Subscription) => void): Observable<T> {
    return lazyConnect<T>(onConnect)(this);
}
// Note, this should really be on type ConnectableObservable but I can't seem to get that working.
(ConnectableObservable as any).prototype.lazyConnect = lazyConnectCompat;
declare module 'rxjs/internal/observable/ConnectableObservable' {
    interface ConnectableObservable<T> {
        lazyConnect: typeof lazyConnectCompat;
    }
}