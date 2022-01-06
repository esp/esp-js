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

import {Observable} from '../../reactive';
import {Logger} from '../logging';

export interface HealthIndicatorTrigger {
    triggerDescription: string;
    trigger: Observable<any>;
}

const DEFAULT_INTERVAL_PERIOD_MS = 5000;

const _log = Logger.create('DefaultHealthIndicatorTrigger');

export const DefaultHealthIndicatorTrigger: HealthIndicatorTrigger = {
    get triggerDescription() {
        return `Default HealthIndicatorTrigger with trigger interval of ${DEFAULT_INTERVAL_PERIOD_MS}`;
    },
    get trigger(): Observable<any> {
        const notification = {};
        return Observable.create<any>(o => {
            const notify = () => {
                try {
                    o.onNext(notification);
                } catch (err) {
                    // Catching and logging here as this may otherwise go undetected given it was a timer scheduled action
                    _log.error(`Error occurred in trigger handler`, err);
                    throw err;
                }
            };
            let interval = setInterval(notify, DEFAULT_INTERVAL_PERIOD_MS);
            return () => {
                clearInterval(interval);
            };
        });
    }
};