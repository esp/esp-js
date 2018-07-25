import * as Rx from 'rx';

Rx.Observable.prototype.lazyConnect = function<T>(disposable: Rx.Disposable) : Rx.Observable<T> {
    let source = this;
    let isConnected = false;
    return Rx.Observable.create<T>(obs => {
        let subscription = source.subscribe(obs);

        // Ensure we subscribe first before we connect to avoid any races
        if(!isConnected) {
            disposable = source.connect();
            isConnected = true;
        }
        return subscription;
    });
};