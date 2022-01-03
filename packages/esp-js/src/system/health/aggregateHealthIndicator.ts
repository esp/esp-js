import {HealthIndicator} from './healthIndicator';
import {Health, HealthStatus} from './health';
import {DefaultHealthIndicatorTrigger, HealthIndicatorTrigger} from './healthIndicatorTrigger';
import {Logger} from '../logging/logger';
import {DisposableBase} from '../disposables/disposableBase';
import {Guard} from '../guard';

const _defaultLog = Logger.create('AggregateHealthIndicator');

export class AggregateHealthIndicator extends DisposableBase implements HealthIndicator {
    private _isStarted = false;
    private _health = Health.builder(AggregateHealthIndicator.constructor.name).isUnknown().build();
    private _healthIndicators: WeakRef<HealthIndicator>[] = [];

    constructor(private _healthIndicatorTrigger: HealthIndicatorTrigger = DefaultHealthIndicatorTrigger, private _log: Logger = _defaultLog) {
        super();
    }

    public get healthIndicatorName() {
        return AggregateHealthIndicator.constructor.name;
    }

    public health(): Health {
        return this._health;
    }

    public get activateIndicatorCount() {
        return this._healthIndicators.length;
    }

    public addIndicator = (healthIndicator: HealthIndicator) => {
        Guard.stringIsNotEmpty(healthIndicator.healthIndicatorName, 'healthIndicatorName can not be empty');
        this._healthIndicators.push(new WeakRef(healthIndicator));
    };

    public removeIndicator = (healthIndicator: HealthIndicator) => {
        if (!healthIndicator) {
            return;
        }
        for (let i = this._healthIndicators.length - 1; i >= 0; i--) {
            const current = this._healthIndicators[i];
            if (current.deref() && current.deref() === healthIndicator) {
                this._healthIndicators.splice(i, 1);
                break;
            }
        }
    };

    protected healthStatusChanged = (oldHealth: Health, newHealth: Health) => {

    };

    public start(): boolean {
        if (!WeakRef) {
            this._log.warn('Health Indicators not supported (WeakRef not found)');
            return false;
        }

        if (this._isStarted) {
            return false;
        }

        this._log.warn(`Starting with trigger [${this._healthIndicatorTrigger.triggerDescription}]`);

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
        let builder = Health.builder(this.healthIndicatorName).isUnknown();
        if (healthIndicators.length > 0) {
            builder = builder.isHealthy();
            for (const healthIndicator of healthIndicators) {
                let healthIndicatorHealth = healthIndicator.health();
                if (!healthIndicatorHealth) {
                    healthIndicatorHealth = Health
                        .builder(healthIndicator.healthIndicatorName)
                        .isUnknown()
                        .addReason('Indicator returned a falsely status')
                        .build();
                }
                // Once Unknown, the overall status stays as Unknown.
                // If there are no Unknowns, but some unhealthy the overall status is Unhealthy.
                if (healthIndicatorHealth.status === HealthStatus.Unknown) {
                    builder.isUnknown();
                } else if (builder.currentStatus !== HealthStatus.Unknown && healthIndicatorHealth.status === HealthStatus.Unhealthy) {
                    builder.isUnhealthy();
                }
                if (healthIndicatorHealth.reasons && healthIndicatorHealth.reasons.length > 0) {
                    builder.addReason(`[Indicator: ${healthIndicator.healthIndicatorName}, status: ${healthIndicatorHealth.status}, reasons: ${healthIndicatorHealth.reasons.join(',')}]`);
                } else {
                    builder.addReason(`[Indicator: ${healthIndicator.healthIndicatorName}, status: ${healthIndicatorHealth.status}]`);
                }
            }
        } else {
            builder = builder.isUnknown();
        }

        let oldHealth = this._health;
        let newHealth = builder.build();
        this._health = newHealth;

        const statusChanged = oldHealth.status !==  newHealth.status;
        if (statusChanged) {
            const reasons = newHealth.reasons && newHealth.reasons.length > 0
                ? newHealth.reasons.join(', ')
                : '';
            this._log.debug(`Status has changed from ${oldHealth.status} to ${newHealth.status}. Reasons: ${reasons}`);
        } else if (isFirstRun) {
            this._log.debug(`Status ${newHealth.status}`);
        }

        this.healthStatusChanged(oldHealth, newHealth);
    };

    private _getIndicators: (isFirstRun: boolean) => HealthIndicator[] = (isFirstRun: boolean) => {
        const liveIndicators: HealthIndicator[] = [];
        let healthIndicatorLength = this._healthIndicators.length;
        for (let i = healthIndicatorLength - 1; i >= 0; i--) {
            const current = this._healthIndicators[i];
            if (current.deref()) {
                liveIndicators.push(current.deref());
            } else {
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