import {Observable } from 'rxjs-compat';
import {RetryPolicyLike, retryWithPolicy} from 'esp-js-ui';
import {SchedulerLike} from 'rxjs';

export function retryWithPolicyCompat<T>(this: Observable<T>, policy: RetryPolicyLike, error?: (err: Error) => void, scheduler?: SchedulerLike): Observable<T> {
    return retryWithPolicy<T>(policy, error, scheduler)(this);
}
(Observable as any).prototype.retryWithPolicy = retryWithPolicyCompat;
declare module 'rxjs/internal/Observable' {
    interface Observable<T> {
        retryWithPolicy: typeof retryWithPolicyCompat;
    }
}