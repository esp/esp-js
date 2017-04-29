import * as Rx from 'rx';

Rx.Observable.prototype.takeUntilInclusive = function<T>(predicate: (item: T) => boolean) : Rx.Observable<T> {
    let source = this;
    return Rx.Observable.create<T>(obs => {
        return source.subscribe(item => {
            obs.onNext(item);
            if (predicate(item)) {
                obs.onCompleted();
            }
        },
        e => obs.onError(e),
        () =>  obs.onCompleted());
    });
};