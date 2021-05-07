import {Observable} from 'rxjs';

export function throwIf<T>(predicate: (item: T) => boolean, errorFactory: (item: T) => Error) : (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        return source.subscribe(item => {
                if (predicate(item)) {
                    subscriber.error(errorFactory(item));
                } else {
                    subscriber.next(item);
                }
            },
            e => subscriber.error(e),
            () =>  subscriber.complete()
        );
    });
}