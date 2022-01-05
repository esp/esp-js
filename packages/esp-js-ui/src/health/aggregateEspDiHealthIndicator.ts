import {GaugeMetric,  MetricFactory} from 'esp-js-metrics';
import {Logger, Health, HealthUtils, AggregateHealthIndicator, DefaultHealthIndicatorTrigger, HealthIndicatorTrigger} from 'esp-js';
import {Container, ContainerNotification} from 'esp-js-di';

const _log = Logger.create('AggregateEspDiHealthIndicator');

export class AggregateEspDiHealthIndicator extends AggregateHealthIndicator {
    private _aggregateHealthMetric: GaugeMetric;
    constructor(private _container: Container, healthIndicatorTrigger: HealthIndicatorTrigger = DefaultHealthIndicatorTrigger) {
        super(healthIndicatorTrigger, _log);
    }

    public get healthIndicatorName() {
        return 'AggregateEspDiHealthIndicator';
    }

    public start() {
        let wasStarted = super.start();
        if (wasStarted) {
            this._container.on('instanceRegistered', this._instanceRegisteredOrCreated);
            this._container.on('instanceCreated', this._instanceRegisteredOrCreated);
            this.addDisposable(() => {
                this._container.off('instanceRegistered', this._instanceRegisteredOrCreated);
                this._container.off('instanceCreated', this._instanceRegisteredOrCreated);
            });
            // this class should be used as a singleton, if createGauge is recalled with the same metric name it may blow depending on the implementation used
            this._aggregateHealthMetric = MetricFactory.createGauge('aggregate_esp_di_health', 'The aggregate health for an application');
        }
        return wasStarted;
    }

    protected healthStatusChanged = (oldHealth: Health, newHealth: Health) => {
        this._aggregateHealthMetric.set(HealthUtils.statusToInt(newHealth.status));
    };

    private _instanceRegisteredOrCreated = (containerNotification: ContainerNotification) => {
        // Check if the object is a HealthIndicator, also ensure it's not this class (which has an _updateHealth function)
        if (HealthUtils.isHealthIndicator(containerNotification.instance) && containerNotification.instance !== this) {
            this.addIndicator(containerNotification.instance);
        }
    };
}