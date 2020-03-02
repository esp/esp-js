import * as Rx from 'rxjs';

Rx.Observable.prototype.lazyConnect = function<T>(onConnect: (subscription: Rx.Subscription) => void) : Rx.Observable<T> {
    let source = this;
    let isConnected = false;
    return Rx.Observable.create((obs: Rx.Subscriber<T>) => {
        let subscription = source.subscribe(obs);

        // Ensure we subscribe first before we connect to avoid any races
        if(!isConnected) {
            const sub = source.connect();
            isConnected = true;
            // delegate the management of the underlying subscription externally
            onConnect(sub);
        }
        return subscription;
    });
};