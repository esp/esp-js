import Guard from '../../../core/guard';
import OperationType from './operationType';

export default class OperationConfig {
    private _serviceType: string;
    private _operationName: string;
    private _serviceId: string;
    private _operationType: OperationType;
    private _requiresAuthentication: boolean;
    private _isAvailable: boolean;
    
    constructor(
        serviceType: string,
        operationName: string,
        serviceId: string,
        operationType: OperationType,
        requiresAuthentication: boolean,
        isAvailable: boolean
    ) {
        Guard.stringIsNotEmpty(serviceType, 'serviceType required');
        Guard.stringIsNotEmpty(operationName, 'operationName required');
        Guard.stringIsNotEmpty(serviceId, 'serviceId required');
        Guard.stringIsNotEmpty(operationType, 'operationType required');
        Guard.isDefined(requiresAuthentication, 'requiresAuthentication required');
        Guard.isBoolean(isAvailable, 'isAvailable required and must be a bool');

        this._serviceType = serviceType;
        this._operationName = operationName;
        this._serviceId = serviceId;
        this._operationType = operationType;
        this._requiresAuthentication = requiresAuthentication;
        this._isAvailable = isAvailable;
    }

    get serviceType(): string {
        return this._serviceType;
    }

    get serviceId(): string {
        return this._serviceId;
    }

    get operationName(): string {
        return this._operationName;
    }

    get operationType(): OperationType {
        return this._operationType;
    }

    get requiresAuthentication(): boolean {
        return this._requiresAuthentication;
    }

    get isAvailable(): boolean {
        return this._isAvailable;
    }

    set isAvailable(isAvailable: boolean) {
        this._isAvailable = isAvailable;
    }
}
