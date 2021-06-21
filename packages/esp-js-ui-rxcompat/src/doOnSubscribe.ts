import {Observable} from 'rxjs-compat';
import {doOnSubscribe} from 'esp-js-rx';

export function doOnSubscribeCompat<T>(this: Observable<T>, action: () => void): Observable<T> {
    return doOnSubscribe<T>(action)(this);
}

(Observable as any).prototype.doOnSubscribe = doOnSubscribeCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        doOnSubscribe: typeof doOnSubscribeCompat;
    }
}