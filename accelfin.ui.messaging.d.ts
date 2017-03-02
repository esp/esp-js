import * as Rx from 'rx';
import { DisposableBase, SingleModelRouter, EventContext } from 'esp-js';
import { ISchedulerService } from './accelfin.ui.core';
import { Message } from 'google-protobuf';

 export declare class MessageEnvelopeDto extends __protobuf.Message {
    constructor();

    getOperationName():string;
    setOperationName(value:string):void;

    getTimestamp():TimestampDto;
    setTimestamp(value:TimestampDto):void;

    getPayload():AnyDto;
    setPayload(value:AnyDto):void;

    getHasCompleted():boolean;
    setHasCompleted(value:boolean):void;

    getError():string;
    setError(value:string):void;

    getCorrelationId():string;
    setCorrelationId(value:string):void;

    getSessionId():string;
    setSessionId(value:string):void;

    getSenderId():string;
    setSenderId(value:string):void;
}

 export declare enum OperationTypeDto {
    RPC = 0,
    REQUEST_STREAM = 1,
    STREAM = 2
}

 export declare class OperationConfigDto extends __protobuf.Message {
    getServiceType():string;
    setServiceType(value:string) : void;

    getOperationName():string;
    setOperationName(value:string) : void;

    getServiceId():string;
    setServiceId(value:string) : void;

    getRequiresAuthentication():boolean;
    setRequiresAuthentication(value:boolean) : void;

    getRequestExchangeName():string;
    setRequestExchangeName(value:string) : void;

    getRequestRoutingKey():string;
    setRequestRoutingKey(value:string) : void;

    getResponseExchangeName():string;
    setResponseExchangeName(value:string) : void;

    getResponseRoutingKey():string;
    setResponseRoutingKey(value:string) : void;

    getOperationType():OperationTypeDto;
    setOperationType(value:OperationTypeDto) : void;

    getIsAvailable():boolean;
    setIsAvailable(value:boolean) : void;
}

 export declare class AnyDto extends __protobuf.Message {
    constructor();

    getCanonicalName():string;
    setCanonicalName(value:string):void;

    getValue():Uint8Array;
    setValue(value:Uint8Array):void;
}

 export declare class TimestampDto extends __protobuf.Message {
    constructor();

    getSeconds():number;
    setSeconds(value:number):void;

    getNanos():number;
    setNanos(value:number):void;
}

 export declare class DecimalDto extends __protobuf.Message {
    constructor();

    getUnscaledValue():number;
    setUnscaledValue(value:number):void;

    getScale():number;
    setScale(value:number):void;
}

export class StreamRequestEvent {
    constructor(correlationId: string, serviceType: string, operationName: string, request: Object, waitForConnection: boolean);
    correlationId: string;
    serviceType: string;
    operationName: string;
    request: Object;
    hasRequest: boolean;
    waitForConnection: boolean;
}

interface IRabbitMqConnectionProxy {
    connect(): void;
    proxyId: string;
    isConnected: boolean;
    disconnect(callback: () => void): void;
    onConnect(callback: () => void): void;
    onReceive(callback: (message: MessageEnvelopeDto) => void): any;
    onError(callback: (errorMessage: string) => void): any;
    send(destination: string, headers: any, dto: MessageEnvelopeDto): any;
    subscribe(destination: string, onMessageCallback: (message: MessageEnvelopeDto) => void, description: string, headers?: Array<any>): any;
    dispose(): void;
}
export class RabbitMqConnectionProxy implements IRabbitMqConnectionProxy {
    constructor();
    connect(): void;
    proxyId: string;
    isConnected: boolean;
    /**
     * Disconnects a client
     * @param callback
     */
    disconnect(callback: () => void): void;
    onConnect(callback: () => void): void;
    onReceive(callback: (message: MessageEnvelopeDto) => void): void;
    onError(callback: (errorMessage: string) => void): void;
    send(destination: string, headers: Array<any>, dto: MessageEnvelopeDto): void;
    subscribe(destination: string, onMessageCallback: (message: MessageEnvelopeDto) => void, description: string, headers?: Array<string>): any;
    dispose(): void;
}
/**
 * A very thin shim over the RabbitMqConnectionProxy that owns the RabbitMqConnectionProxy and can recreate if it dies.
 * Can be used by multiple model entities to talk to rabbit.
 */
export class RabbitMqGateway extends DisposableBase {
    constructor(router: SingleModelRouter<MessagingModel>, rabbitmqFactory: () => IRabbitMqConnectionProxy, schedulerService: ISchedulerService);
    connect(): void;
    disconnect(): void;
    send(destination: string, headers: Array<string>, messageEnvelopeDto: MessageEnvelopeDto): void;
    subscribe(correlationId: string, responseDestination: string, description: string, headers?: Array<string>): {
        id: string;
        unsubscribe: () => void;
    };
}
export class OperationConfig {
    constructor(serviceType: string, operationName: string, serviceId: string, operationType: OperationType, requiresAuthentication: boolean, isAvailable: boolean);
    serviceType: string;
    serviceId: string;
    operationName: string;
    operationType: OperationType;
    requiresAuthentication: boolean;
    isAvailable: boolean;
}
export class OperationType {
    static stream: string;
    static requestStream: string;
    static rpc: string;
}
export class ConnectionStatus {
    static idle: ConnectionStatus;
    static connected: ConnectionStatus;
    static disconnected: ConnectionStatus;
    constructor(name: string);
    name: string;
}
export class InFlightOperations extends DisposableBase {
    constructor(router: SingleModelRouter<MessagingModel>, rabbitMqGateway: RabbitMqGateway);
    observeEvents(): void;
    preProcess(): void;
    hasUpdate(correlationId: string): boolean;
    getUpdate(correlationId: string): MessageOperation;
}
/**
 * 'immutable' version of internal messaging state
 */
export class MessageOperation {
    _operationState: OperationState;
    constructor(operationState: OperationState);
    correlationId: string;
    serviceType: string;
    operationName: string;
    hasResult: boolean;
    result: Object;
    hasError: boolean;
    error: Error;
    isCompleted: boolean;
}
export class MessagingModel extends DisposableBase {
    static RECONNECT_AFTER_MS: number;
    constructor(router: SingleModelRouter<MessagingModel>, rabbitMqGateway: RabbitMqGateway, schedulerService: ISchedulerService);
    observeEvents(): void;
    preProcess(): void;
    isConnected: boolean;
    connectionStatus: ConnectionStatus;
    inFlightOperations: InFlightOperations;
    serviceInstanceMonitor: ServiceInstanceMonitor;
    sessionId: string;
    hasSessionId: boolean;
    isAuthenticated: boolean;
    connectionId: string;
}
export class OperationState {
    constructor(event: StreamRequestEvent);
    correlationId: string;
    serviceType: string;
    sessionId: string;
    operationName: string;
    waitForConnection: boolean;
    operationConfig: OperationConfig;
    result: Object;
    error: Error;
    isCompleted: boolean;
    /**
     * The rabbit mq subscription
     * @returns {{unsubscribe, (): void}}
     */
    subscription: {
        unsubscribe(): void;
    };
    isActive: boolean;
    messageOperation: MessageOperation;
    description: string;
    setActive(sessionId: string, operationConfigUsed: OperationConfig): void;
    /**
     * the request, if any
     */
    createRequestDto(): MessageEnvelopeDto;
    /**
     * used to tell the server the client is done with this operation
     */
    createTerminationRequestDto(): MessageEnvelopeDto;
}
export class OperationStatus {
    name: string;
    isConnected: boolean;
    constructor(name: string, isConnected: boolean);
}
export class ServiceInstanceMonitor extends DisposableBase {
    constructor(router: SingleModelRouter<MessagingModel>, rabbitMqGateway: RabbitMqGateway, schedulerService: ISchedulerService);
    statusUpdated: boolean;
    observeEvents(): void;
    preProcess(): void;
    /**
     * Returns the status for the currently selected instance of a service type (if any),
     * else if no selected instance returns disconnected.
     *
     * Note that even if there are unselected available instances this still returns disconnected.
     *
     * Callers should just retry operations which will result on an instance becoming selected again
     * @param serviceType
     * @returns {*}
     */
    getServiceStatus(serviceType: string): ConnectionStatus;
    /**
     * Returns an array of ServiceStatus which contains all informtaion relating to that service types connection status
     */
    getAllServiceStatus(): Array<ServiceStatus>;
    getOperationConfig(serviceType: string, operationName: string): OperationConfig;
}
export class ServiceInstanceStatus {
    constructor(serviceType: string, serviceId: string, isConnected: boolean, isSelected: boolean, operationStatus: Array<OperationStatus>);
    serviceType: string;
    serviceId: string;
    isConnected: boolean;
    isSelected: boolean;
    operationStatus: Array<OperationStatus>;
}
export class ServiceStatus {
    constructor(serviceType: string, isConnected: boolean, instances: Array<ServiceInstanceStatus>);
    serviceType: string;
    isConnected: boolean;
    instances: Array<ServiceInstanceStatus>;
}

export class AnyDtoMapper {
    static addMetaDataToProtoContracts(): void;
    static _addMetaDataToProtoContracts(container: any, namespaceString?: string): void;
    static mapToAnyDto(messageDto: Message): any;
    static mapFromAnyDto(anyDto: AnyDto): Message;
}
export class Connection extends DisposableBase {
    constructor(schedulerService: ISchedulerService, rabbitmqFactory: () => IRabbitMqConnectionProxy);
    connectionStatusStream: Rx.Observable<ConnectionStatus>;
    /**
     * Gets a connection status stream for a particular service type
     */
    serviceStatusStream(serviceType: string): Rx.Observable<ConnectionStatus>;
    /**
     * Gets a stream of ServiceStatus for all services that are known
     */
    servicesStatusStream(): Rx.Observable<Array<ServiceStatus>>;
    isConnected: boolean;
    initialise(): void;
    connect(): void;
    disconnect(): void;
    /**
     * Sets the sessionId obtained as a result of a login call. Note that this sessionId is used across all connected services,
     * there is no concept of a per-back-end-service session. You're either connected to the system or not, it's the backends
     * job to federate the session id
     * @param sessionId
     */
    setSessionId(sessionId: string): void;
    setIsAuthenticated(isAuthenticated: boolean): void;
    clearSessionId(): void;
    requestStream<TRequest extends Message, TResponse extends Message>(serviceType: string, operationName: string, request: TRequest, waitForConnection?: boolean): Rx.Observable<TResponse>;
    stream<TResponse extends Message>(serviceType: string, operationName: string, waitForConnection?: boolean): Rx.Observable<TResponse>;
}
export class ServiceBase extends DisposableBase {
    protected _connection: Connection;
    constructor(serviceType: string, connection: Connection);
    connectionStatus: Rx.Observable<ConnectionStatus>;
}
