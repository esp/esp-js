import {interval, Observable} from 'rxjs';

export interface HealthIndicatorTrigger {
    trigger: Observable<any>;
}

export const DefaultHealthIndicatorTrigger: HealthIndicatorTrigger = {
    get trigger(): Observable<any> {
        return interval(5000);
    }
};