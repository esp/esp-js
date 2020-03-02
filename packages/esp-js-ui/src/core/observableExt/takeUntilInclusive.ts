import * as Rx from 'rxjs';

Rx.Observable.prototype.takeUntilInclusive = function<T>(predicate: (item: T) => boolean) : Rx.Observable<T> {
    let source = this;
    return Rx.Observable.create((obs: Rx.Subscriber<T>) => {
        return source.subscribe(item => {
            obs.next(item);
            if (predicate(item)) {
                obs.complete();
            }
        },
        e => obs.error(e),
        () =>  obs.complete());
    });
};