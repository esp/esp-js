import {Observable} from 'rxjs';
import {takeUntilInclusive} from 'esp-js-ui';

export function takeUntilInclusiveCompat<T>(predicate: (item: T) => boolean): Observable<T> {
    return takeUntilInclusive<T>(predicate)(this);
}
(Observable as any).prototype.takeUntilInclusive = takeUntilInclusiveCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        takeUntilInclusive: typeof takeUntilInclusiveCompat;
    }
}