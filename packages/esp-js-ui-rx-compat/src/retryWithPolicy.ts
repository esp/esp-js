import {RetryPolicy, retryWithPolicy} from 'esp-js-ui';
import {Observable, SchedulerLike} from 'rxjs';

export function retryWithPolicyCompat<T>(policy: RetryPolicy, error?: (err: Error) => void, scheduler?: SchedulerLike): Observable<T> {
    return retryWithPolicy<T>(policy, error, scheduler)(this);
}
(Observable as any).prototype.retryWithPolicy = retryWithPolicyCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        retryWithPolicy: typeof retryWithPolicyCompat;
    }
}