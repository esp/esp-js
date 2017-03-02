import OperationStatus from './operationStatus';

export default class ServiceInstanceStatus {
    private _serviceType: string;
    private _serviceId: string;
    private _isConnected: boolean;
    private _isSelected: boolean;
    private _operationStatus: Array<OperationStatus>;

    constructor(
        serviceType: string,
        serviceId: string,
        isConnected: boolean,
        isSelected: boolean,
        operationStatus: Array<OperationStatus>
    ) {
        this._serviceType = serviceType;
        this._serviceId = serviceId;
        this._isConnected = isConnected;
        this._isSelected = isSelected;
        this._operationStatus = operationStatus;
    }

    get serviceType():string {
        return this._serviceType;
    }

    get serviceId():string {
        return this._serviceId;
    }

    get isConnected():boolean {
        return this._isConnected;
    }

    get isSelected():boolean {
        return this._isSelected;
    }

    get operationStatus():Array<OperationStatus> {
        return this._operationStatus;
    }
}
