import {Observable} from '../../reactive';

export interface HealthIndicatorTrigger {
    trigger: Observable<any>;
}

export const DefaultHealthIndicatorTrigger: HealthIndicatorTrigger = {
    get trigger(): Observable<any> {
        const notification = {};
        return Observable.create<any>(o => {
            const notify = () => {
                o.onNext(notification);
            };
            let interval = setInterval(notify, 5000);
            return () => {
                clearInterval(interval);
            };
        });
    }
};