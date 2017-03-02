import * as Rx from 'rx';
import * as uuid from 'node-uuid';
import { DisposableBase, SingleModelRouter, observeEvent } from 'esp-js';
import { ISchedulerService, Guard, Logger } from '../../core';
import { EventConst } from '../events';
import InFlightOperations from './inFlightOperations';
import Timer from './timer';
import RabbitMqGateway from '../gateways/rabbitMqGateway';
import ServiceInstanceMonitor from './serviceInstanceMonitor';
import ConnectionStatus from './connectionStatus';

const _log: Logger = Logger.create('MessagingModel');

export default class MessagingModel extends DisposableBase {
    private _router:SingleModelRouter<MessagingModel>;
    private _connectCalled: boolean;
    private _isConnected:boolean;
    private _rabbitMqGateway:RabbitMqGateway;
    private _inFlightOperations:InFlightOperations;
    private _autoDisconnectDisposable:Rx.SerialDisposable;
    private _serviceInstanceMonitor:ServiceInstanceMonitor;
    private _schedulerService:ISchedulerService;
    private _timer:Timer<MessagingModel>;
    private _connectionStatus:ConnectionStatus;
    private _sessionId:string;
    private _isAuthenticated: boolean;
    private _connectionId:string;

    static get RECONNECT_AFTER_MS():number {
        return 5000;
    }
 
    constructor(router:SingleModelRouter<MessagingModel>,
                rabbitMqGateway:RabbitMqGateway,
                schedulerService:ISchedulerService) {
        super();
        Guard.isDefined(router, 'router required');
        Guard.isDefined(rabbitMqGateway, 'rabbitMqGateway required');
        this._router = router;
        this._rabbitMqGateway = rabbitMqGateway;
        this._connectCalled = false;
        this._isConnected = false;
        this._schedulerService = schedulerService;
        this._connectionStatus = ConnectionStatus.idle;
        this._autoDisconnectDisposable = new Rx.SerialDisposable();
        this._sessionId = '';
        this._isAuthenticated = false;
        this.addDisposable(this._autoDisconnectDisposable);
        this._timer = new Timer<MessagingModel>(router, schedulerService);
        this.addDisposable(this._timer);
        this._serviceInstanceMonitor = new ServiceInstanceMonitor(router, rabbitMqGateway, schedulerService);
        this.addDisposable(this._serviceInstanceMonitor);
        this._inFlightOperations = new InFlightOperations(router, rabbitMqGateway);
        this.addDisposable(this._inFlightOperations);
        this._resetConnectionId();
    }

    observeEvents():void {
        this.addDisposable(this._router.observeEventsOn(this));
        this._serviceInstanceMonitor.observeEvents();
        this._inFlightOperations.observeEvents();
        this._timer.start();
    }

    preProcess() {
        this._serviceInstanceMonitor.preProcess();
        this._inFlightOperations.preProcess();
    }

    get isConnected():boolean {
        return this._isConnected;
    }

    get connectionStatus():ConnectionStatus {
        return this._connectionStatus;
    }

    get inFlightOperations():InFlightOperations {
        return this._inFlightOperations;
    }

    get serviceInstanceMonitor() {
        return this._serviceInstanceMonitor;
    }

    get sessionId() {
        return this._sessionId;
    }

    get hasSessionId() {
        return typeof this._sessionId !== 'undefined' && this._sessionId !== '';
    }

    get isAuthenticated() {
        return this._isAuthenticated;
    }

    get connectionId() {
        return this._connectionId;
    }

    @observeEvent(EventConst.initEvent)
    _onInitEvent() {
        this._isConnected = false;
        this._connectionStatus = ConnectionStatus.idle;
    }

    @observeEvent(EventConst.connectEvent)
    _onConnectEvent() {
        if (!this._connectCalled) {
            this._connectCalled = true;
            this._rabbitMqGateway.connect();
        }
    }

    @observeEvent(EventConst.disconnectEvent)
    _onDisconnectEvent() {
        if (this._connectCalled) {
            this._rabbitMqGateway.disconnect();
        }
    }

    @observeEvent(EventConst.rabbitMqConnectedEvent)
    _onRabbitMqConnectedEvent() {
        this._isConnected = true;
        this._connectionStatus = ConnectionStatus.connected;
    }

    @observeEvent(EventConst.rabbitMqDisconnectedEvent)
    _onRabbitMqDisconnectedEvent(event, context) {
        this._sessionId = '';
        this._isConnected = false;
        this._connectCalled = false;
        this._resetConnectionId();
        if (event.wasManualDisconnect) {
            this._connectionStatus = ConnectionStatus.idle;
        } else {
            this._connectionStatus = ConnectionStatus.disconnected;
            this._scheduleBounce();
        }
        context.commit();
    }

    @observeEvent(EventConst.setSessionIdEvent)
    _onSetSessionIdEvent(event, context) {
        _log.info(`setting session id to [${event.sessionId}]`);
        this._sessionId = event.sessionId;
        context.commit();
    }

    @observeEvent(EventConst.setIsAuthenticated)
    _onSetIsAuthenticated(event, context) {
        if (this._isAuthenticated !== event.isAuthenticated) {
            _log.info(`setting isAuthenticated id to [${event.isAuthenticated}]`);
            this._isAuthenticated = event.isAuthenticated;
            context.commit();
        }
    }

    @observeEvent(EventConst.clearSessionIdEvent)
    _onClearSessionIdEvent() {
        _log.info('clearing session id');
        this._sessionId = '';
    }

    _resetConnectionId() {
        // the connection id is associated with an underlying connection to MQ, not to a user, or a session
        this._connectionId = uuid.v4();
    }

    _scheduleBounce() {
        _log.info('Scheduling a bounce');
        this.addDisposable(
            this._schedulerService.async.scheduleFuture(
                '',
                MessagingModel.RECONNECT_AFTER_MS,
                (scheduler: Rx.IScheduler, state: string) => {
                    let shouldRun = true;
                    if(shouldRun) {
                        this._router.runAction(() => {
                            this._rabbitMqGateway.connect();
                        });
                    }
                    return Rx.Disposable.create(() => {
                        shouldRun = false;
                    });
                } 
            )
        );
    }
}
