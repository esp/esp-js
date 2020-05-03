import {Observable} from 'rxjs';

export function takeUntilInclusive<T>(predicate: (item: T) => boolean) : (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        return source.subscribe(item => {
                subscriber.next(item);
                if (predicate(item)) {
                    subscriber.complete();
                }
            },
            e => subscriber.error(e),
            () =>  subscriber.complete()
        );
    });
}

// Compatibility layer:
export function takeUntilInclusiveCompat<T>(predicate: (item: T) => boolean): Observable<T> {
    return takeUntilInclusive<T>(predicate)(this);
}
(Observable as any).prototype.takeUntilInclusive = takeUntilInclusiveCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        takeUntilInclusive: typeof takeUntilInclusiveCompat;
    }
}