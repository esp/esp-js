import { Guard } from '../guard';

export enum HealthStatus {
    Healthy = 'Healthy',
    Unhealthy = 'Unhealthy',
    Unknown = 'Unknown',
}

export interface Health {
    name: string;
    status: HealthStatus;
    reasons: string[];
}

export namespace Health {
    export const builder = (name: string) => {
        Guard.stringIsNotEmpty(name, 'Can not build Health, name must be a string and non empty');
        return new HealthStatusBuilder(name);
    };
}

export class HealthStatusBuilder {
    private _reasons = [];
    private _status: HealthStatus = HealthStatus.Unknown;

    constructor(private _name: string) {

    }

    get currentStatus() {
        return this._status;
    }

    /**
     * Sets HealthStatus to Unknown, shorthand for setStatus(HealthStatus.Unknown)
     */
    isUnknown(): this {
        this._status = HealthStatus.Unknown;
        return this;
    }

    /**
     * Sets HealthStatus to Healthy, shorthand for setStatus(HealthStatus.Healthy)
     */
    isHealthy(): this {
        this._status = HealthStatus.Healthy;
        return this;
    }

    /**
     * Sets HealthStatus to Unhealthy, shorthand for setStatus(HealthStatus.Unhealthy)
     */
    isUnhealthy(): this {
        this._status = HealthStatus.Unhealthy;
        return this;
    }

    setStatus(status: HealthStatus): this {
        Guard.stringIsNotEmpty(status, 'status can not be empty');
        this._status = status;
        return this;
    }

    /**
     * Adds a reason for the health, typically only used when the status isn't HealthStatus.Healthy
     */
    addReason(reason: string): this {
        Guard.stringIsNotEmpty(reason, 'Can not build Health, reason must be a string and non empty');
        this._reasons.push(reason);
        return this;
    }

    build(): Health {
        return {
            name: this._name,
            status: this._status,
            reasons: this._reasons
        };
    }
}