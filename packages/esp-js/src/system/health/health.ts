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

import { Guard } from '../guard';

export enum HealthStatus {
    Healthy = 'Healthy',
    Unhealthy = 'Unhealthy',
    Unknown = 'Unknown',
    Terminal = 'Terminal',
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

    /**
     * Sets HealthStatus to Terminal, shorthand for setStatus(HealthStatus.Terminal)
     */
    isTerminal(): this {
        this._status = HealthStatus.Terminal;
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