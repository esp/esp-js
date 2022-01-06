// notice_start
/*
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

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
                return -1;
        }
    };
}