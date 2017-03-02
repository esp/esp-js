import Guard from '../../../core/guard';
import OperationConfig from './operationConfig';
import OperationType from './operationType';

export default class RpcOperationConfig extends OperationConfig {
    private _requestExchange: string;
    private _requestRoutingKey: string;

    constructor(
        serviceType:string,
        operationName:string,
        serviceId:string,
        requestExchange:string,
        requestRoutingKey:string,
        requiresAuthentication:boolean,
        isAvailable:boolean
    ) {
        super(serviceType, operationName, serviceId, OperationType.rpc, requiresAuthentication, isAvailable);
        Guard.stringIsNotEmpty(requestExchange, 'requestExchange required');
        Guard.stringIsNotEmpty(requestRoutingKey, 'requestRoutingKey required');

        this._requestExchange = requestExchange;
        this._requestRoutingKey = requestRoutingKey;
    }

    get requestExchange(): string {
        return this._requestExchange;
    }

    get requestDestination(): string {
        return `/exchange/${this.requestExchange}/${this._requestRoutingKey}`;
    }
}
