import Guard from '../../../core/guard';
import StreamOperationConfig from './streamOperationConfig';
import OperationType from './operationType';

export default class RequestStreamOperationConfig extends StreamOperationConfig {
    private _requestExchange: string;
    private _requestRoutingKey: string;

    constructor(
        serviceType: string,
        operationName: string,
        serviceId: string,
        requestExchange: string,
        requestRoutingKey: string,
        responseExchange: string,
        responseRoutingKey: string,
        requiresAuthentication: boolean,
        isAvailable: boolean
    ) {
        super(
            serviceType, 
            operationName, 
            serviceId, 
            responseExchange, 
            responseRoutingKey, 
            requiresAuthentication, 
            isAvailable, 
            OperationType.requestStream);
        Guard.stringIsNotEmpty(requestExchange, 'requestExchange required');
        Guard.stringIsNotEmpty(requestRoutingKey, 'requestRoutingKey required');

        this._requestExchange = requestExchange;
        this._requestRoutingKey = requestRoutingKey;
    }

    get requestExchange(): string {
        return this._requestExchange;
    }

    // request destinations never have a session ID as the services
    // listen to all requests for all sessions
    get requestDestination(): string {
        return `/exchange/${this.requestExchange}/${this._requestRoutingKey}`;
    }
}
