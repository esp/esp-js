import {HealthIndicator} from './healthIndicator';
import {HealthStatus} from './health';

export namespace HealthUtils {
    export const isHealthIndicator = (o: any): o is HealthIndicator => {
        let isObject = typeof o === 'object' && o !== null;
        return isObject && 'health' in o && 'healthIndicatorName' in o;
    };
    export const statusToInt = (status: HealthStatus) => {
        switch (status) {
            case HealthStatus.Unhealthy:
                return 0;
            case HealthStatus.Healthy:
                return 1;
            case HealthStatus.Unknown:
            default:
                return 2;
        }
    };
}