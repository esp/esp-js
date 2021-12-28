import {Guard} from 'esp-js';

export enum HealthStatus {
    Healthy = 'Healthy',
    Unhealthy = 'Unhealthy',
    Unknown = 'Unknown',
}

export interface Health {
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

    isUnknown(): this {
        this._status = HealthStatus.Unknown;
        return this;
    }

    isHealthy(): this {
        this._status = HealthStatus.Healthy;
        return this;
    }

    isUnhealthy(): this {
        this._status = HealthStatus.Unhealthy;
        return this;
    }

    addReason(reason: string): this {
        Guard.stringIsNotEmpty(reason, 'Can not build Health, reason must be a string and non empty');
        this._reasons.push(reason);
        return this;
    }

    build(): Health {
        return {
            status: this._status,
            reasons: this._reasons
        };
    }
}