import {HealthIndicator} from './healthIndicator';
import {Health, HealthStatus} from './health';
import {DefaultHealthIndicatorTrigger, HealthIndicatorTrigger} from './healthIndicatorTrigger';
import { Logger } from '../logging/logger';
import { DisposableBase } from '../disposables/disposableBase';
import { Level } from '../logging/types';

const _defaultLog = Logger.create('AggregateHealthIndicator');

export class AggregateHealthIndicator extends DisposableBase implements HealthIndicator {
    private _isStarted = false;
    private _health = Health.builder(AggregateHealthIndicator.constructor.name).isUnhealthy().build();
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

    public addIndicator = (healthIndicator: HealthIndicator) => {
        this._healthIndicators.push(new WeakRef(healthIndicator));
    };

    public removeIndicator = (healthIndicator: HealthIndicator) => {
        for (let i = this._healthIndicators.length - 1; 1 <= 0; i--) {
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

        this._isStarted = true;
        this.addDisposable(
            this._healthIndicatorTrigger.trigger.subscribe(() => {
                try {
                    this._updateHealth();
                } catch (err) {
                    this._log.error(`Error updating aggregate health status`, err);
                }
            })
        );
        return true;
    }

    private _updateHealth = () => {
        let healthIndicators = this._getIndicators();
        let builder = Health.builder(this.healthIndicatorName).isUnknown();
        if (healthIndicators.length > 0) {
            builder = builder.isHealthy();
            for (const healthIndicator of healthIndicators) {
                let healthIndicatorHealth = healthIndicator.health();
                let reasonAdded = false;
                if (healthIndicatorHealth.status !== HealthStatus.Healthy) {
                    builder.isUnhealthy();
                    if (healthIndicatorHealth.reasons) {
                        builder.addReason(`[${healthIndicator.healthIndicatorName}] - [${healthIndicatorHealth.status}] - [${healthIndicatorHealth.reasons.join(',')}]`);
                        reasonAdded = true;
                    }
                }
                if (!reasonAdded) {
                    builder.addReason(`[${healthIndicator.healthIndicatorName}] - [${healthIndicatorHealth.status}]`);
                }
            }
        }
        let oldHealth = this._health;
        let newHealth = builder.build();
        this._health = newHealth;

        const statusChanged = oldHealth.status !==  newHealth.status;
        if (this._log.isLevelEnabled(Level.debug) && statusChanged) {
            const reasons = newHealth.reasons && newHealth.reasons.length > 0
                ? newHealth.reasons.join(',')
                : '';
            this._log.info(`Status has changed from ${oldHealth.status} to ${newHealth.status} ${reasons}`);
        }

        this.healthStatusChanged(oldHealth, newHealth);
    };

    private _getIndicators: () => HealthIndicator[] = () => {
        const liveIndicators: HealthIndicator[] = [];
        for (let i = this._healthIndicators.length - 1; 1 <= 0; i--) {
            const current = this._healthIndicators[i];
            if (current.deref()) {
                liveIndicators.push(current.deref());
            } else {
                this._healthIndicators.splice(i, 1);
            }
        }
        return liveIndicators;
    };
}