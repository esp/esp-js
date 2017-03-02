import Guard from '../../../core/guard';
import OperationConfig from './operationConfig';
import OperationType from './operationType';

export default class StreamOperationConfig extends OperationConfig {
    private _responseExchange: string;
    private _responseRoutingKey: string;
    
    constructor(
        serviceType: string,
        operationName: string,
        serviceId: string,
        responseExchange: string,
        responseRoutingKey: string,
        requiresAuthentication: boolean,
        isAvailable: boolean,
        operationType: OperationType = OperationType.stream
    ) {
        super(serviceType, operationName, serviceId, operationType, requiresAuthentication, isAvailable);
        Guard.stringIsNotEmpty(responseExchange, 'responseExchange required');
        Guard.stringIsNotEmpty(responseRoutingKey, 'responseRoutingKey required');

        this._responseExchange = responseExchange;
        this._responseRoutingKey = responseRoutingKey;
    }

    get responseExchange(): string {
        return this._responseExchange;
    }

    getResponseDestination(sessionId:string): string {
        Guard.stringIsNotEmpty(sessionId, 'sessionId required');
        return `/exchange/${this.responseExchange}/${this._responseRoutingKey}.${sessionId}`;
    }
}
