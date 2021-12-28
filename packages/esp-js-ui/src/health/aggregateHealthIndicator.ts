import {DisposableBase, Level, Logger} from 'esp-js';
import {HealthIndicator} from './healthIndicator';
import {HealthStatus, Health} from './health';
import {Container, ContainerNotification} from 'esp-js-di';
import {HealthUtils} from './healthutils';
import {interval, SchedulerLike} from 'rxjs';
import {MetricFactory} from 'esp-js';
import {asyncScheduler} from 'rxjs';

const _log = Logger.create('AggregateHealthIndicator');

const aggregateHealthMetric = MetricFactory.createGauge('aggregate_health', 'The aggregate health for an application');

export class AggregateHealthIndicator extends DisposableBase implements HealthIndicator {
    private static Name = 'AggregateHealthIndicator';
    private _isStarted = false;
    private _health = Health.builder(AggregateHealthIndicator.Name).isUnhealthy().build();
    private _healthIndicators: WeakRef<HealthIndicator>[] = [];

    constructor(container: Container, private _scheduler: SchedulerLike = asyncScheduler) {
        super();
        if (WeakRef) {
            container.on('instanceRegistered', this._instanceRegisteredOrCreated);
            container.on('instanceCreated', this._instanceRegisteredOrCreated);
            this.addDisposable(() => {
                container.off('instanceRegistered', this._instanceRegisteredOrCreated);
                container.off('instanceCreated', this._instanceRegisteredOrCreated);
            });
            this._start();
        } else {
            _log.warn('Health Indicators not supported');
        }
    }

    public get healthIndicatorName() {
        return AggregateHealthIndicator.Name;
    }

    public health(): Health {
        return this._health;
    }

    private _start() {
        if (this._isStarted) {
            return;
        }
        this._isStarted = true;
        this.addDisposable(
            interval(5000, this._scheduler).subscribe(() => {
                try {
                    this._updateHealth();
                } catch (err) {
                    _log.error(`Error updating aggregate health status`, err);
                }
            })
        );
    }

    private _instanceRegisteredOrCreated = (containerNotification: ContainerNotification) => {
        let object = containerNotification.reference.deref();
        // Check if the object is a HealthIndicator, also ensure it's not this class (which has an _updateHealth function)
        if (object && HealthUtils.isHealthIndicator(object) && object !== this) {
            this._healthIndicators.push(<WeakRef<HealthIndicator>>containerNotification.reference);
        }
    };

    private _updateHealth = () => {
        let healthIndicators = this._getLiveIndicators();
        let builder = Health.builder(AggregateHealthIndicator.Name).isUnknown();
        if (healthIndicators.length > 0) {
            builder = builder.isHealthy();
            for (const healthIndicator of healthIndicators) {
                let healthIndicatorHealth = healthIndicator.health();
                if (healthIndicatorHealth.status !== HealthStatus.Healthy) {
                    builder.isUnhealthy();
                    if (healthIndicatorHealth.reasons) {
                        builder.addReason(`[${healthIndicator.healthIndicatorName}]: [${healthIndicatorHealth.reasons.join(',')}]`);
                    }
                    break;
                }
            }
        }
        let oldHealth = this._health;
        let newHealth = builder.build();
        this._health = newHealth;
        aggregateHealthMetric.set(HealthUtils.statusToInt(this._health.status));

        const statusChanged = oldHealth.status !==  newHealth.status;
        if (_log.isLevelEnabled(Level.debug) && statusChanged) {
            const reasons = newHealth.reasons && newHealth.reasons.length > 0
                ? newHealth.reasons.join(',')
                : '';
            _log.warn(`Status has changed from ${oldHealth.status} to ${newHealth.status} ${reasons}`);
        }
    };

    private _getLiveIndicators: () => HealthIndicator[] = () => {
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