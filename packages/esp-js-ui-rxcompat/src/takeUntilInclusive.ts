import {Observable} from 'rxjs-compat';
import {takeUntilInclusive} from 'esp-js-rx';

export function takeUntilInclusiveCompat<T>(this: Observable<T>, predicate: (item: T) => boolean): Observable<T> {
    return takeUntilInclusive<T>(predicate)(this);
}
(Observable as any).prototype.takeUntilInclusive = takeUntilInclusiveCompat;