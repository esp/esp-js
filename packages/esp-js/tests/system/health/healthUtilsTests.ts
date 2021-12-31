// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
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

import {HealthUtils, HealthIndicator, Health} from '../../../src/system';

describe('HealthUtils', () => {
    const indicator: HealthIndicator = {
        healthIndicatorName: 'a-name',
        health(): Health {
            return Health.builder('the-health').isHealthy().build();
        }
    };

    class Indicator {
        public healthIndicatorName = 'a-name';
        health(): Health {
            return Health.builder('the-health').isHealthy().build();
        }
    }

    class IndicatorWithGetter {
        public get healthIndicatorName() {
            return 'a-name';
        }
        health(): Health {
            return Health.builder('the-health').isHealthy().build();
        }
    }

    it('isHealthIndicator - returns true for class instance of correct shape', () => {
        expect(HealthUtils.isHealthIndicator(new Indicator())).toBeTruthy();
    });

    it('isHealthIndicator - returns true for class instance using getters', () => {
        expect(HealthUtils.isHealthIndicator(new IndicatorWithGetter())).toBeTruthy();
    });

    it('isHealthIndicator - returns true for object of correct shape', () => {
        expect(HealthUtils.isHealthIndicator(indicator)).toBeTruthy();
    });

    it('isHealthIndicator - returns true for object of correct shape with non enumerable HealthIndicator props', () => {
        const indicator1  = {
            health(): Health {
                return Health.builder('the-health').isHealthy().build();
            }
        };
        Object.defineProperty(indicator1, 'healthIndicatorName', { get: function() { return 'a-name'; }, enumerable: false });
        expect(HealthUtils.isHealthIndicator(indicator1)).toBeTruthy();
    });
});