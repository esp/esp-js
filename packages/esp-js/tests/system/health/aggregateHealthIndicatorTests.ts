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

import {AggregateHealthIndicator, DefaultHealthIndicatorTrigger, EsNextFeatureDetectionLike, Health, HealthIndicator, HealthStatus, Logger} from '../../../src/system';

class TestAggregateHealthIndicator extends AggregateHealthIndicator {
    public updates: {oldHealth: Health, newHealth: Health}[] = [];
    protected healthStatusChanged = (oldHealth: Health, newHealth: Health) => {
        this.updates.push({oldHealth, newHealth});
    };
}

/**
 * This is a helper class that has no real health concern, it's API is just used to facilitate setting the underlying health.
 * In real live it'd derive its health from some business or system functionality and internally builds its own health.
 */
class TestHealthIndicator implements HealthIndicator {
    constructor(public healthIndicatorName: string) {
    }
    public currentHealth: Health;
    public health(): Health {
        return this.currentHealth;
    }
    public setHealth(health: Health) {
        this.currentHealth = health;
        return this;
    }
    public addReason(reason: string) {
        this.currentHealth = Health
            .builder(this.healthIndicatorName)
            .setStatus(this.currentHealth.status)
            .addReason(reason).build();
        return this;
    }
}

describe('AggregateHealthIndicator', () => {
    let updates = 0;
    let aggregateIndicator: TestAggregateHealthIndicator = null;
    let indicator1: TestHealthIndicator;
    let indicator2: TestHealthIndicator;
    let indicator3: TestHealthIndicator;
    let wasStarted: boolean;
    let testEsNextFeatureDetection: EsNextFeatureDetectionLike;

    beforeAll(() => {
        jest.useFakeTimers();
        jest.spyOn(global, 'setInterval');
    });

    afterAll(() => {
        jest.useRealTimers();
    });

    beforeEach(() => {
        jest.clearAllTimers();
        updates = 0;
        testEsNextFeatureDetection = {
            supportsWeakRef: true
        };
    });

    const createIndicators = () => {
        aggregateIndicator = new TestAggregateHealthIndicator(
            Logger.create('AggregateHealthIndicator'),
            DefaultHealthIndicatorTrigger,
            testEsNextFeatureDetection
        );
        indicator1 = new TestHealthIndicator('indicator1');
        indicator2 = new TestHealthIndicator('indicator2');
        indicator3 = new TestHealthIndicator('indicator3');
    };

    const addAllIndicators = () => {
        aggregateIndicator.addIndicator(indicator1);
        aggregateIndicator.addIndicator(indicator2);
        aggregateIndicator.addIndicator(indicator3);
    };

    // sets health based on given status, if given status is falsely will set an invalid health (undefined)
    const stateAllStatuses = (status1: HealthStatus, status2: HealthStatus, status3: HealthStatus) => {
        indicator1.setHealth(status1 ? Health.builder(indicator1.healthIndicatorName).setStatus(status1).build() : undefined);
        indicator2.setHealth(status2 ? Health.builder(indicator2.healthIndicatorName).setStatus(status2).build() : undefined);
        indicator3.setHealth(status3 ? Health.builder(indicator3.healthIndicatorName).setStatus(status3).build() : undefined);
    };

    describe('when started', () => {
        beforeEach(() => {
            createIndicators();
            wasStarted = aggregateIndicator.start();
        });

        it('start returns true', () => {
            expect(wasStarted).toEqual(true);
        });

        it('start only starts once true', () => {
            expect(aggregateIndicator.start()).toEqual(false);
        });

        it('hasIndicator finds indicator', () => {
            addAllIndicators();
            expect(aggregateIndicator.hasIndicator(indicator1)).toBeTruthy();
            expect(aggregateIndicator.hasIndicator(indicator2)).toBeTruthy();
            expect(aggregateIndicator.hasIndicator(indicator3)).toBeTruthy();
            expect(aggregateIndicator.hasIndicator(new TestHealthIndicator('indicator4'))).toBeFalsy();
        });

        it('hasIndicatorByName finds indicator', () => {
            addAllIndicators();
            expect(aggregateIndicator.hasIndicatorByName('indicator1')).toBeTruthy();
            expect(aggregateIndicator.hasIndicatorByName('indicator2')).toBeTruthy();
            expect(aggregateIndicator.hasIndicatorByName('indicator3')).toBeTruthy();
            expect(aggregateIndicator.hasIndicatorByName('indicator4')).toBeFalsy();
        });

        it('status - default status is Unknown', () => {
            expect(aggregateIndicator.health().status).toEqual(HealthStatus.Unknown);
        });

        it('status - if indicator returns an undefined status, overall status is Unknown', () => {
            indicator1.setHealth(undefined);
            indicator2.setHealth(Health.builder(indicator2.healthIndicatorName).isHealthy().build());
            aggregateIndicator.addIndicator(indicator1);
            aggregateIndicator.addIndicator(indicator2);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.health().status).toEqual(HealthStatus.Unknown);
            expect(aggregateIndicator.health().reasons.length).toEqual(2);
            expect(aggregateIndicator.health().reasons[0]).toEqual('[Indicator: indicator2, status: Healthy]');
            expect(aggregateIndicator.health().reasons[1]).toEqual('[Indicator: indicator1, status: Unknown, reasons: Indicator returned a falsely status]');
        });

        test.each([
            [HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy],
            [HealthStatus.Unhealthy, HealthStatus.Unhealthy, HealthStatus.Unhealthy, HealthStatus.Unhealthy],
            [HealthStatus.Unknown, HealthStatus.Unknown, HealthStatus.Unknown, HealthStatus.Unknown],

            [HealthStatus.Unhealthy, HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Unhealthy],
            [HealthStatus.Healthy, HealthStatus.Unhealthy, HealthStatus.Healthy, HealthStatus.Unhealthy],
            [HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Unhealthy, HealthStatus.Unhealthy],

            [HealthStatus.Unknown, HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Unknown],
            [HealthStatus.Healthy, HealthStatus.Unknown, HealthStatus.Healthy, HealthStatus.Unknown],
            [HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Unknown, HealthStatus.Unknown],

            [HealthStatus.Terminal, HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Terminal],
            [HealthStatus.Healthy, HealthStatus.Terminal, HealthStatus.Healthy, HealthStatus.Terminal],
            [HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Terminal, HealthStatus.Terminal],

            [undefined, HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Unknown],
            [HealthStatus.Healthy, undefined, HealthStatus.Healthy, HealthStatus.Unknown],
            [HealthStatus.Healthy, HealthStatus.Healthy, undefined, HealthStatus.Unknown],
            [HealthStatus.Terminal, HealthStatus.Healthy, undefined, HealthStatus.Terminal],
        ])('Status of [%s, %s, %s] = %s', (indicator1Status, indicator2Status, indicator3Status, expectedAggregatedStatus) => {
            addAllIndicators();
            stateAllStatuses(indicator1Status, indicator2Status, indicator3Status);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.health().status).toEqual(expectedAggregatedStatus);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.health().status).toEqual(expectedAggregatedStatus);
        });

        it('healthStatusChanged called on change', () => {
            addAllIndicators();

            stateAllStatuses(HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.updates.length).toEqual(1);
            expect(aggregateIndicator.updates[0].oldHealth.status).toEqual(HealthStatus.Unknown);
            expect(aggregateIndicator.updates[0].newHealth.status).toEqual(HealthStatus.Healthy);

            stateAllStatuses(HealthStatus.Unhealthy, HealthStatus.Healthy, HealthStatus.Healthy);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.updates.length).toEqual(2);
            expect(aggregateIndicator.updates[1].oldHealth.status).toEqual(HealthStatus.Healthy);
            expect(aggregateIndicator.updates[1].newHealth.status).toEqual(HealthStatus.Unhealthy);

            stateAllStatuses(HealthStatus.Unhealthy, HealthStatus.Unknown, HealthStatus.Healthy);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.updates.length).toEqual(3);
            expect(aggregateIndicator.updates[2].oldHealth.status).toEqual(HealthStatus.Unhealthy);
            expect(aggregateIndicator.updates[2].newHealth.status).toEqual(HealthStatus.Unknown);
        });

        it('Indicators can be weak referenced', (done) => {
            jest.useRealTimers();
            aggregateIndicator.addIndicator(indicator1);
            aggregateIndicator.addIndicator(indicator2);
            aggregateIndicator.addIndicator(indicator3, false);
            stateAllStatuses(HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy);
            expect(aggregateIndicator.activateIndicatorCount).toEqual(3);
            indicator1 = undefined;
            indicator3 = undefined;
            // this is a bit of a cowboy test however given the AggregateHealthIndicator can hold WeakRef s to things it's required
            if (global.gc) {
                // it seems that we need to run the gc on the next tick after de-referencing the indicators
                setTimeout(() => {
                    global.gc();
                    jest.useFakeTimers();
                    jest.advanceTimersByTime(5000);
                    // only indicator 1 should be removed, indicator 3 was added with useWeakReference=false
                    expect(aggregateIndicator.activateIndicatorCount).toEqual(2);
                    expect(aggregateIndicator.hasIndicatorByName('indicator2')).toBeTruthy();
                    expect(aggregateIndicator.hasIndicatorByName('indicator3')).toBeTruthy();
                    done();
                }, 0);
            } else {
                fail(`can't trigger GC, call jest with --expose-gc`);
            }
        });

        it('removeIndicator - remvoes indicator', () => {
            addAllIndicators();
            expect(aggregateIndicator.activateIndicatorCount).toEqual(3);
            aggregateIndicator.removeIndicator(indicator2);
            expect(aggregateIndicator.activateIndicatorCount).toEqual(2);
        });

        it('dispose - stops pushing updates', () => {
            addAllIndicators();

            stateAllStatuses(HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.updates.length).toEqual(1);
            expect(aggregateIndicator.health().status).toEqual(HealthStatus.Healthy);

            aggregateIndicator.dispose();

            stateAllStatuses(HealthStatus.Healthy, HealthStatus.Healthy, HealthStatus.Healthy);
            jest.advanceTimersByTime(5000);
            expect(aggregateIndicator.updates.length).toEqual(1); // no change

            expect(aggregateIndicator.health().status).toEqual(HealthStatus.Unknown); // should be set on dispose
        });
    });

    describe('when WeakRef not supported', () => {
        beforeEach(() => {
            testEsNextFeatureDetection.supportsWeakRef = false;
            createIndicators();
            wasStarted = aggregateIndicator.start();
        });

        it('start returns false', () => {
            expect(wasStarted).toEqual(false);
        });

        it('adding indicator has no effect', () => {
            expect(wasStarted).toEqual(false);
            aggregateIndicator.addIndicator(indicator1);
            expect(aggregateIndicator.hasIndicator(indicator1)).toBeFalsy();
        });
    });
});
