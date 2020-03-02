import * as Rx from 'rxjs/Rx';

Rx.Observable.prototype.doOnSubscribe = function<T>(action: () => void) : Rx.Observable<T> {
    let source = this;
    return Rx.Observable.defer<T>(() => {
        action();
        return source;
    });
};