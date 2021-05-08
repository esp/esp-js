import {Observable, Subscription} from 'rxjs';

export function throwOnSignal<T, TSignal>(signal: Observable<TSignal>, errorFactory: (signal: TSignal) => Error) : (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        const subscription =  new Subscription();
        subscription.add(
            signal.subscribe(s => {
                const error = errorFactory(s);
                subscriber.error(error);
            },
                error => subscriber.error(error),
                () => subscriber.complete()
            )
        );
        subscription.add(source.subscribe(subscriber));
        return subscription;
    });
}