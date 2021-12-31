import {Observable} from '../../reactive';

export interface HealthIndicatorTrigger {
    triggerDescription: string;
    trigger: Observable<any>;
}

const DEFAULT_INTERVAL_PERIOD_MS = 5000;

export const DefaultHealthIndicatorTrigger: HealthIndicatorTrigger = {
    get triggerDescription() {
        return `Default HealthIndicatorTrigger with trigger interval of ${DEFAULT_INTERVAL_PERIOD_MS}`;
    },
    get trigger(): Observable<any> {
        const notification = {};
        return Observable.create<any>(o => {
            const notify = () => {
                o.onNext(notification);
            };
            let interval = setInterval(notify, DEFAULT_INTERVAL_PERIOD_MS);
            return () => {
                clearInterval(interval);
            };
        });
    }
};