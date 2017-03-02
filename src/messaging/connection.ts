import * as Rx from 'rx';
import { Router, SingleModelRouter, DisposableBase } from 'esp-js';
import * as uuid from 'node-uuid';
import { EventConst, StreamRequestEvent, StreamDisposedEvent } from './events';
import { RabbitMqGateway } from './gateways';
import ConnectionStatus from './model/connectionStatus';
import { Guard, ISchedulerService } from '../core';
import ServiceStatus from './model/serviceStatus';
import MessagingModel from './model/messagingModel';
import {IRabbitMqConnectionProxy} from './gateways/iRabbitMqConnectionProxy';
import { Message } from 'google-protobuf';

export default class Connection extends DisposableBase {
    private _router:SingleModelRouter<MessagingModel>;
    private _initialiseCalled: boolean;
    private _connectionStatusStream: Rx.Observable<ConnectionStatus>;
    private _isConnected;

    constructor(schedulerService:ISchedulerService, rabbitmqFactory:() => IRabbitMqConnectionProxy) {
        super();
        Guard.isDefined(schedulerService, 'schedulerService required');
        Guard.isDefined(rabbitmqFactory, 'rabbitmqFactory required');
        this._bootstrapModel(schedulerService, rabbitmqFactory);
        this._connectionStatusStream = this._createConnectionStatusStream();
        this._initialiseCalled = false;
    }

    _bootstrapModel(schedulerService:ISchedulerService, rabbitmqFactory:() => IRabbitMqConnectionProxy) {
        let router = new Router();
        this._router = router.createModelRouter<MessagingModel>('messagingModelId');
        let messagingModel = new MessagingModel(
            this._router,
            new RabbitMqGateway(
                this._router,
                rabbitmqFactory,
                schedulerService
            ),
            schedulerService
        );
        router.addModel('messagingModelId', messagingModel);
        messagingModel.observeEvents();
    }

    get connectionStatusStream():Rx.Observable<ConnectionStatus> {
        return this._connectionStatusStream;
    }

    /**
     * Gets a connection status stream for a particular service type
     */
    serviceStatusStream(serviceType:string) : Rx.Observable<ConnectionStatus> {
        Guard.isString(serviceType, 'serviceType must be a string');
        let _this:Connection = this;
        return Rx.Observable.create<ConnectionStatus>(observer => {
            let disposable = _this._router.getModelObservable<MessagingModel>()
                .map(m => m.serviceInstanceMonitor.getServiceStatus(serviceType))
                .subscribe(
                    serviceConnectionStatus => {
                        // _log.verbose(`service status`, serviceConnectionStatus);
                        observer.onNext(serviceConnectionStatus);
                    }
                );
            return disposable;
        }).distinctUntilChanged();
    }

    /**
     * Gets a stream of ServiceStatus for all services that are known
     */
    servicesStatusStream() : Rx.Observable<Array<ServiceStatus>> {
        let _this:Connection = this;
        return Rx.Observable.create<Array<ServiceStatus>>(observer => {
            let disposable = _this._router.getModelObservable<MessagingModel>()
                .where(m => m.serviceInstanceMonitor.statusUpdated)
                .map(m => m.serviceInstanceMonitor.getAllServiceStatus())
                .subscribe(
                    (allServiceStatuses:Array<ServiceStatus>) => {
                        observer.onNext(allServiceStatuses);
                    }
                );
            return disposable;
        });
    }

    get isConnected():boolean {
        return this._isConnected;
    }

    initialise() {
        if(this._initialiseCalled) {
            return;
        }
        this._initialiseCalled = true;
        let _this:Connection = this;
        this.addDisposable(
            this._router.getModelObservable<MessagingModel>()
                .subscribe(
                    model => {
                        _this._isConnected = model.isConnected;
                    }
                )
        );
        this._router.publishEvent(EventConst.initEvent, {});
    }

    connect() {
        this.initialise();
        this._router.publishEvent(EventConst.connectEvent, {});
    }

    disconnect() {
        this._router.publishEvent(EventConst.disconnectEvent, {});
    }

    /**
     * Sets the sessionId obtained as a result of a login call. Note that this sessionId is used across all connected services,
     * there is no concept of a per-back-end-service session. You're either connected to the system or not, it's the backends
     * job to federate the session id
     * @param sessionId
     */
    setSessionId(sessionId:string) {
        Guard.isString(sessionId, 'sessionId must be a string');
        this._router.publishEvent(EventConst.setSessionIdEvent, {sessionId:sessionId});
    }

    setIsAuthenticated(isAuthenticated:boolean) {
        Guard.isDefined(isAuthenticated, 'isAuthenticated must be defined');
        this._router.publishEvent(EventConst.setIsAuthenticated, {isAuthenticated:isAuthenticated});
    }

    clearSessionId() {
        this._router.publishEvent(EventConst.clearSessionIdEvent, {});
    }

    requestStream<TRequest extends Message, TResponse extends Message>(
        serviceType:string,
        operationName:string,
        request:TRequest,
        waitForConnection:boolean = false
    ):Rx.Observable<TResponse> {
        Guard.isString(serviceType, 'serviceType must be a string');
        Guard.isString(operationName, 'operationName must be a string');
        Guard.isDefined(request, 'request must be defined');
        return this._stream<TRequest, TResponse>(serviceType, operationName, request, waitForConnection);
    }

    stream<TResponse extends Message>(
        serviceType:string,
        operationName:string,
        waitForConnection:boolean = false
    ):Rx.Observable<TResponse> {
        Guard.isString(serviceType, 'serviceType must be a string');
        Guard.isString(operationName, 'operationName must be a string');
        return this._stream<any, TResponse>(serviceType, operationName, undefined, waitForConnection);
    }

    _stream<TRequest extends Message, TResponse extends Message>(
        serviceType:string,
        operationName:string,
        request:TRequest = undefined,
        waitForConnection:boolean = false
    ):Rx.Observable<TResponse> {
        let self:Connection = this;
        return Rx.Observable.create<TResponse>(observer => {
            let disposables = new Rx.CompositeDisposable();
            let correlationId:string = uuid.v4();
            disposables.add(
                self._router.getModelObservable<MessagingModel>()
                    .where(m => m.inFlightOperations.hasUpdate(correlationId))
                    .map(m => m.inFlightOperations.getUpdate(correlationId))
                    .subscribe(
                        message => {
                            if (disposables.isDisposed) {
                                return;
                            }
                            if (message.error) {
                                observer.onError(message.error);
                            } else {
                                if (message.result) {
                                    observer.onNext(<TResponse>message.result);
                                }
                                if (message.isCompleted) {
                                    observer.onCompleted();
                                }
                            }
                        }
                    )
            );
            let streamRequestEvent = new StreamRequestEvent(
                correlationId,
                serviceType,
                operationName,
                request,
                waitForConnection
            );
            this._router.publishEvent(EventConst.streamEvent, streamRequestEvent);
            disposables.add(Rx.Disposable.create(() => {
                let streamDisposedEvent = new StreamDisposedEvent(
                    correlationId,
                    serviceType,
                    operationName
                );
                this._router.publishEvent(EventConst.streamDisposedEvent, streamDisposedEvent);
            }));
            return disposables;
        });
    }

    _createConnectionStatusStream():Rx.Observable<ConnectionStatus> {
        let _this:Connection = this;
        return Rx.Observable.create<ConnectionStatus>(observer => {
            let disposable = _this._router.getModelObservable<MessagingModel>()
                .map(m => m.connectionStatus)
                .subscribe(
                    (connectionStatus:ConnectionStatus) => {
                        observer.onNext(connectionStatus);
                    }
                );
            return disposable;
        }).distinctUntilChanged().replay(null, 1).refCount();
    }
}
