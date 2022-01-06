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

import {Health, HealthStatus} from '../../../src/system';

describe('Health', () => {

    it('builder - sets name', () => {
        let health = Health.builder('foo').build();
        expect(health.name).toEqual('foo');
    });

    it('builder - throws if name empty', () => {
        expect(() => {
            Health.builder(null);
        }).toThrow();
        expect(() => {
            Health.builder(undefined);
        }).toThrow();
        expect(() => {
            Health.builder('');
        }).toThrow();
    });

    it('builder - isHealthy', () => {
        let health = Health.builder('foo').isHealthy().build();
        expect(health.status).toEqual(HealthStatus.Healthy);
    });

    it('builder - isUnhealthy', () => {
        let health = Health.builder('foo').isUnhealthy().build();
        expect(health.status).toEqual(HealthStatus.Unhealthy);
    });

    it('builder - isUnknown', () => {
        let health = Health.builder('foo').isUnknown().build();
        expect(health.status).toEqual(HealthStatus.Unknown);
    });

    it('builder - setStatus', () => {
        let health = Health.builder('foo').setStatus(HealthStatus.Healthy).build();
        expect(health.status).toEqual(HealthStatus.Healthy);
    });

    it('builder - addReason', () => {
        let health = Health.builder('foo').setStatus(HealthStatus.Healthy)
            .addReason('a reason 1')
            .addReason('a reason 2')
            .build();
        expect(health.reasons.length).toEqual(2);
        expect(health.reasons[0]).toEqual('a reason 1');
        expect(health.reasons[1]).toEqual('a reason 2');
    });

    it('builder - throws if reason empty', () => {
        let health = Health.builder('foo');
        expect(() => {
            health.addReason(null);
        }).toThrow();
        expect(() => {
            health.addReason(undefined);
        }).toThrow();
        expect(() => {
            health.addReason('');
        }).toThrow();
    });
});