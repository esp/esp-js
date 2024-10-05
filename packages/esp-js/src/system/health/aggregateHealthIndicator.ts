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
import {Health, HealthStatus} from './health';
import {DefaultHealthIndicatorTrigger, HealthIndicatorTrigger} from './healthIndicatorTrigger';
import {Logger} from '../logging/logger';
import {DisposableBase} from '../disposables/disposableBase';
import {Guard} from '../guard';
import {Level} from '../logging';
import {EsNextFeatureDetection, EsNextFeatureDetectionLike} from '../esNextFeatureDetection';

const _defaultLog = Logger.create('AggregateHealthIndicator');

class IndicatorRecord {
    private _weakRef?: WeakRef<HealthIndicator>;
    private _hardRef?: HealthIndicator;
    private _name: string;

    constructor(
        indicator: HealthIndicator,
        private _useWeakReference: boolean = true,
    ) {
        this._name = indicator.healthIndicatorName;
        if (_useWeakReference) {
            this._weakRef = new WeakRef<HealthIndicator>(indicator);
        } else {
            this._hardRef = indicator;
        }
    }
    public get name() {
        return this._name;
    }
    public get reference() {
        return this._useWeakReference
            ? this._weakRef.deref()
            : this._hardRef;
    }
}

export class AggregateHealthIndicator extends DisposableBase implements HealthIndicator {
    private _isStarted = false;
    private _health = Health.builder(AggregateHealthIndicator.constructor.name).isUnknown().build();
    private _healthIndicators: IndicatorRecord[] = [];

    constructor(
        protected _log: Logger = _defaultLog,
        private _healthIndicatorTrigger: HealthIndicatorTrigger = DefaultHealthIndicatorTrigger,
        private _esNextFeatureDetection: EsNextFeatureDetectionLike = EsNextFeatureDetection,
    ) {
        super();
    }

    public get healthIndicatorName() {
        return 'AggregateHealthIndicator';
    }

    public health(): Health {
        return this._health;
    }

    public get activateIndicatorCount() {
        return this._healthIndicators.length;
    }

    /**
     * Adds an indicator which will contribute to the aggregate status.
     * This doesn't check if the indicator is already added.
     *
     * @param healthIndicator - the indicator
     * @param useWeakReference - if true (default) the indicator will be weakly referenced
     */
    public addIndicator = (healthIndicator: HealthIndicator, useWeakReference = true) => {
        Guard.isObject(healthIndicator, 'healthIndicatorName must be an object and not falsely');
        Guard.stringIsNotEmpty(healthIndicator.healthIndicatorName, 'healthIndicatorName can not be empty');
        if (!this._esNextFeatureDetection.supportsWeakRef) {
            this._log.warn(`Health Indicators not supported (WeakRef not found). Won\'t add indicator ${healthIndicator.healthIndicatorName}`);
            return;
        }
        this._log.debug(`Adding indicator ${healthIndicator.healthIndicatorName}`);
        this._healthIndicators.push(new IndicatorRecord(healthIndicator, useWeakReference));
    };

    /**
     * Removes the first occurrence of the indicator if found
     */
    public removeIndicator = (healthIndicator: HealthIndicator) => {
        if (!healthIndicator) {
            return;
        }
        for (let i = this._healthIndicators.length - 1; i >= 0; i--) {
            const current = this._healthIndicators[i];
            if (current.reference && current.reference === healthIndicator) {
                this._log.debug(`Removing indicator ${current.reference.healthIndicatorName}`);
                this._healthIndicators.splice(i, 1);
                break;
            }
        }
    };

    /**
     * Returns true on the first occurrence of the indicator found
     */
    public hasIndicator =  (healthIndicator: HealthIndicator) => {
        return this._healthIndicators.some(ir => ir.reference === healthIndicator);
    }

    /**
     * Returns true on the first occurrence of the indicator found
     */
    public hasIndicatorByName =  (name: string) => {
        return this._healthIndicators.some(ir => ir.reference && ir.reference.healthIndicatorName === name);
    }

    protected healthStatusChanged = (oldHealth: Health, newHealth: Health) => {

    };

    public start(): boolean {
        if (!this._esNextFeatureDetection.supportsWeakRef) {
            this._log.warn('Health Indicators not supported (WeakRef not found)');
            return false;
        }

        if (this._isStarted) {
            return false;
        }

        this._log.info(`Starting with trigger [${this._healthIndicatorTrigger.triggerDescription}]`);

        let isFirstRun = true;
        this.addDisposable(
            this._healthIndicatorTrigger.trigger.subscribe(() => {
                try {
                    this._updateHealth(isFirstRun);
                    if (isFirstRun) {
                        isFirstRun = false;
                    }
                } catch (err) {
                    this._log.error(`Error updating aggregate health status`, err);
                }
            })
        );
        this._isStarted = true;
        return true;
    }

    public dispose() {
        this._health = Health.builder(this.healthIndicatorName).isUnknown().build();
        this._log.debug('Disposing');
        super.dispose();
    }

    private _updateHealth = (isFirstRun: boolean) => {
        let healthIndicators = this._getIndicators(isFirstRun);
        let health = Health.builder(this.healthIndicatorName).isUnknown();
        if (healthIndicators.length > 0) {
            health = health.isHealthy();
            for (const healthIndicator of healthIndicators) {
                let healthIndicatorHealth = healthIndicator.health();
                if (!healthIndicatorHealth) {
                    healthIndicatorHealth = Health
                        .builder(healthIndicator.healthIndicatorName)
                        .isUnknown()
                        .addReason('Indicator returned a falsely status')
                        .build();
                }
                // Once Terminal, the overall status stays as Terminal.
                // Once Unknown, the overall status stays as Unknown.
                // If there are no Terminal or Unknowns, but some unhealthy the overall status is Unhealthy.
                // else Healthy
                if (health.currentStatus === HealthStatus.Terminal || healthIndicatorHealth.status === HealthStatus.Terminal) {
                    health.isTerminal();
                } else if (health.currentStatus === HealthStatus.Unknown || healthIndicatorHealth.status === HealthStatus.Unknown) {
                    health.isUnknown();
                } else if (healthIndicatorHealth.status === HealthStatus.Unhealthy) {
                    health.isUnhealthy();
                }
                if (healthIndicatorHealth.reasons && healthIndicatorHealth.reasons.length > 0) {
                    health.addReason(`[Indicator: ${healthIndicator.healthIndicatorName}, status: ${healthIndicatorHealth.status}, reasons: ${healthIndicatorHealth.reasons.join(', ')}]`);
                } else {
                    health.addReason(`[Indicator: ${healthIndicator.healthIndicatorName}, status: ${healthIndicatorHealth.status}]`);
                }
            }
        } else {
            health = health.isUnknown();
        }

        let oldHealth = this._health;
        let newHealth = health.build();
        this._health = newHealth;

        const statusChanged = oldHealth.status !==  newHealth.status;
        if (statusChanged) {
            let message = `Status has changed from ${oldHealth.status} to ${newHealth.status}. Reasons: ${this._aggregateHealthReasons(newHealth)}`;
            if (newHealth.status === HealthStatus.Terminal) {
                this._log.error(message);
            } else if (newHealth.status === HealthStatus.Unhealthy) {
                this._log.error(message);
            } else {
                this._log.info(message);
            }
        } else if (isFirstRun) {
            this._log.debug(`Status ${newHealth.status}. Reasons: ${this._aggregateHealthReasons(newHealth)}`);
        } else if (this._log.isLevelEnabled(Level.verbose)) {
            this._log.verbose(`Status ${newHealth.status}. Reasons: ${this._aggregateHealthReasons(newHealth)}`);
        }

        try {
            this.healthStatusChanged(oldHealth, newHealth);
        } catch (err) {
            this._log.error(`Error signaling health status change`, err);
        }
    };

    private _aggregateHealthReasons(newHealth: Health) {
        const reasons = newHealth.reasons && newHealth.reasons.length > 0
            ? newHealth.reasons.join(', ')
            : '';
        return reasons;
    }

    private _getIndicators: (isFirstRun: boolean) => HealthIndicator[] = (isFirstRun: boolean) => {
        const liveIndicators: HealthIndicator[] = [];
        let healthIndicatorLength = this._healthIndicators.length;
        for (let i = healthIndicatorLength - 1; i >= 0; i--) {
            let indicatorRecord = this._healthIndicators[i];
            if (indicatorRecord.reference) {
                liveIndicators.push(indicatorRecord.reference);
            } else {
                this._log.debug(`Health indicator ${indicatorRecord.name} is no longer referenced, removing`);
                this._healthIndicators.splice(i, 1);
            }
        }
        // We log the first time this runs, or when the indicator count changes, either log can count as the first run log.
        if (healthIndicatorLength !== this._healthIndicators.length) {
            this._log.debug(`Monitored HealthIndicator count changed from ${healthIndicatorLength} to ${this._healthIndicators.length}`);
        } else if (isFirstRun) {
            this._log.debug(`Monitored HealthIndicator count ${this._healthIndicators.length}`);
        }
        return liveIndicators;
    };
}