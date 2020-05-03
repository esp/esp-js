import { Observable } from 'rxjs';

export function doOnSubscribe<T>(action: () => void) : (source: Observable<T>) => Observable<T> {
    return (source: Observable<T>) => new Observable<T>((subscriber) => {
        action();
        let subscription = source.subscribe(subscriber);
        return () => {
            subscription.unsubscribe();
        };
    });
}