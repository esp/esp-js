import MessageOperation from './messageOperation';
import OperationConfig from './operations/operationConfig';
import StreamRequestEvent from '../events/streamRequestEvent';
import {MessageEnvelopeDto} from '../lib/dtos/service-common-contracts_pb';
import AnyDtoMapper from '../anyDtoMapper';

export default class OperationState {
    private _correlationId:string;
    private _serviceType:string;
    private _result:Object;
    private _error:Error;
    private _operationConfigUsedForRequest:OperationConfig;
    private _operationName:string;
    private _isCompleted:boolean;
    private _subscription:{unsubscribe() : void };
    private _messageOperation:MessageOperation;
    private _waitForConnection:boolean;
    private _sessionId:string;
    private _requestPayload:any;
    private _isActive:boolean;

    constructor(event:StreamRequestEvent) {
        this._isCompleted = false;
        this._isActive = false;
        this._serviceType = event.serviceType;
        this._operationName = event.operationName;
        this._correlationId = event.correlationId;
        this._waitForConnection = event.waitForConnection;
        this._messageOperation = new MessageOperation(this);
        this._requestPayload = event.request;
        this._operationConfigUsedForRequest = null;
    }

    get correlationId():string {
        return this._correlationId;
    }

    get serviceType():string {
        return this._serviceType;
    }

    get sessionId():string {
        return this._sessionId;
    }

    get operationName():string {
        return this._operationName;
    }

    get waitForConnection():boolean {
        return this._waitForConnection;
    }

    get operationConfig() : OperationConfig {
        return this._operationConfigUsedForRequest;
    }

    get result():Object {
        return this._result;
    }

    set result(value:Object) {
        this._result = value;
    }

    get error():Error {
        return this._error;
    }

    set error(value:Error) {
        this._error = value;
    }

    get isCompleted():boolean {
        return this._isCompleted;
    }

    set isCompleted(value:boolean) {
        this._isCompleted = value;
    }

    /**
     * The rabbit mq subscription
     * @returns {{unsubscribe, (): void}}
     */
    get subscription():{unsubscribe() : void } {
        return this._subscription;
    }

    set subscription(value:{unsubscribe() : void }) {
        this._subscription = value;
    }

    get isActive():boolean {
        return this._isActive;
    }

    get messageOperation():MessageOperation {
        return this._messageOperation;
    }

    get description() {
        if(this.isActive) {
            return `[${this.serviceType}:${this.operationConfig.serviceId}:${this.operationName}:${this.correlationId}]`;

        } else {
            return `[${this.serviceType}:${this.operationName}:${this.correlationId}]`;
        }
    }

    setActive(sessionId:string, operationConfigUsed:OperationConfig) {
        this._isActive = true;
        this._sessionId = sessionId;
        this._operationConfigUsedForRequest = operationConfigUsed;
    }

    /**
     * the request, if any
     */
    createRequestDto() : MessageEnvelopeDto  {
        let messageEnvelopeDto = new MessageEnvelopeDto();
        messageEnvelopeDto.setOperationName(this.operationName);
        messageEnvelopeDto.setCorrelationId(this.correlationId);
        messageEnvelopeDto.setSessionId(this.sessionId);
        let anyDto = AnyDtoMapper.mapToAnyDto(this._requestPayload);
        messageEnvelopeDto.setPayload(anyDto);
        return messageEnvelopeDto;
    }

    /**
     * used to tell the server the client is done with this operation
     */
    createTerminationRequestDto() : MessageEnvelopeDto {
        let messageEnvelopeDto = new MessageEnvelopeDto();
        messageEnvelopeDto.setOperationName(this.operationName);
        messageEnvelopeDto.setCorrelationId(this.correlationId);
        messageEnvelopeDto.setSessionId(this.sessionId);
        messageEnvelopeDto.setHasCompleted(true);
        return messageEnvelopeDto;
    }
}
