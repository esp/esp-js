import {Health} from './health';

export interface HealthIndicator {
    healthIndicatorName: string;
    health: Health;
}