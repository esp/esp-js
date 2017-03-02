import ServiceInstanceStatus from './serviceInstanceStatus';

export default class ServiceStatus {
    private _serviceType: string;
    private _isConnected: boolean;
    private _instances: Array<ServiceInstanceStatus>;

    constructor(serviceType: string, isConnected: boolean, instances: Array<ServiceInstanceStatus>) {
        this._serviceType = serviceType;
        this._isConnected = isConnected;
        this._instances = instances;
    }

    get serviceType(): string {
        return this._serviceType;
    }

    get isConnected(): boolean {
        return this._isConnected;
    }

    get instances(): Array<ServiceInstanceStatus> {
        return this._instances;
    }
}
