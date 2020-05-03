import { Observable } from 'rxjs';
import {doOnSubscribe} from 'esp-js-ui';

export function doOnSubscribeCompat<T>(action: () => void): Observable<T> {
    return doOnSubscribe<T>(action)(this);
}
(Observable as any).prototype.doOnSubscribe = doOnSubscribeCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        doOnSubscribe: typeof doOnSubscribeCompat;
    }
}