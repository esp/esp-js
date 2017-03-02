import * as _ from 'lodash';
import { DisposableBase, SingleModelRouter, observeEvent, ObservationStage , EventContext } from 'esp-js';
import { EventConst } from '../events';
import { OperationType } from './operations';
import RabbitMqGateway from '../gateways/rabbitMqGateway';
import Logger from '../../core/logger';
import Guard from '../../core/guard';
import MessageOperation from './messageOperation';
import MessagingModel from './messagingModel';
import RabbitMqMessageReceivedEvent from '../events/rabbitMqMessageReceivedEvent';
import ServicesOfflineEvent from '../events/servicesOfflineEvent';
import OperationState from './operationState';
import StreamRequestEvent from '../events/streamRequestEvent';
import OperationConfig from './operations/operationConfig';
import StreamOperationConfig from './operations/streamOperationConfig';
import RpcOperationConfig from './operations/rpcOperationConfig';

const _log: Logger = Logger.create('InFlightOperations');

export default class InFlightOperations extends DisposableBase {
    private _router:SingleModelRouter<MessagingModel>;
    private _rabbitMqGateway:RabbitMqGateway;
    private _messageState:any;

    constructor(router:SingleModelRouter<MessagingModel>,
                rabbitMqGateway:RabbitMqGateway) {
        super();
        Guard.isDefined(router, 'router required');
        Guard.isDefined(rabbitMqGateway, 'rabbitMqGateway required');
        this._router = router;
        this._rabbitMqGateway = rabbitMqGateway;
        this._messageState = {};
    }

    observeEvents():void {
        this.addDisposable(this._router.observeEventsOn(this));
    }

    preProcess() {
        _.forOwn(this._messageState, state => {
            // note that any changes to an operations state would have been dispatched
            // on the last dispatch loop, given this we clean up here.
            if (state.isCompleted || state.error !== undefined) {
                _log.debug(`operation [${state.description}] finished. Deleting`);
                delete this._messageState[state.correlationId];
            } else if (state.result !== undefined) { //tslint:disable-line
                state.result = null;
            }
        });
    }

    hasUpdate(correlationId:string):boolean {
        return this._messageState[correlationId] !== undefined; //tslint:disable-line
    }

    getUpdate(correlationId:string):MessageOperation {
        let state = this._messageState[correlationId];
        return state.messageOperation;
    }

    @observeEvent(EventConst.streamEvent)
    _onStreamEvent(event:StreamRequestEvent, context:EventContext, model:MessagingModel) {
        let state = new OperationState(event);
        this._messageState[state.correlationId] = state;
        this._trySendSubscription(model, state);
    }

    @observeEvent(EventConst.rabbitMqMessageReceivedEvent)
    _onRabbitMqMessageReceivedEvent(event:RabbitMqMessageReceivedEvent):void {
        let state = this._messageState[event.correlationId];
        if (state) {
            _log.verbose(`Response received for [${state.description}]]`, event.payload);
            state.result = event.payload;
            state.error = event.error;
            state.isCompleted = event.isCompleted;
        }
    }

    @observeEvent(EventConst.streamDisposedEvent)
    _onStreamDisposedEvent(event, context:EventContext, model:MessagingModel) {
        let state = this._messageState[event.correlationId];
        // if there was an error it's possible that dispose was called as a result of that,
        // in this case state will have already been cleaned up
        if(state) {
            if (state.isActive && state.subscription) {
                try {
                    // send the server an ack of the pending unsubscribe
                    let operationSentRequest =
                        state.operationConfig.operationType == OperationType.rpc || //tslint:disable-line
                        state.operationConfig.operationType == OperationType.requestStream; //tslint:disable-line
                    if (operationSentRequest) {
                        _log.debug(`Sending termination ack for [${state.description}] sending to  destination ${state.operationConfig.requestDestination}`);
                        this._rabbitMqGateway.send(
                            state.operationConfig.requestDestination,
                            null, // no headers
                            state.createTerminationRequestDto()
                        );
                    }
                    _log.info(`unsubscribing from [${state.description}]`);
                    state.subscription.unsubscribe();
                } catch (err) {
                    _log.error(`Error unsubscribing for [${state.description}]`, err);
                }
            }
            state.isCompleted = true;
        }
    }

    @observeEvent(EventConst.serviceOnlineEvent)
    @observeEvent(EventConst.setIsAuthenticated, ObservationStage.committed)
    _onServiceOnlineEvent(event, context:EventContext, model:MessagingModel) {
        _.forOwn(this._messageState, state => {
            if (!state.isActive) {
                this._trySendSubscription(model, state);
            }
        });
    }

    @observeEvent(EventConst.rabbitMqDisconnectedEvent, ObservationStage.committed)
    _onRabbitMqDisconnectedEvent() {
        _.forOwn(this._messageState, state => {
            if(state.isActive && !state.isCompleted || !state.waitForConnection) {
                _log.debug(`Marking [${state.description}] as error`);
                state.error = new Error('Connection disconnect');
            }
        });
    }

    @observeEvent(EventConst.servicesOfflineEvent)
    _onServiceOfflineEvent(event:ServicesOfflineEvent) {
        _log.debug('Services offline checking for in-flight messages');
        _.forOwn(this._messageState, state => {
            let requestSent = !state.isCompleted && state.operationConfig;
            if (requestSent && event.serviceIsOffline(state.operationConfig.serviceId)) {
                _log.debug(`setting message operation error on [${state.description}]`);
                state.error = new Error('Service disconnect');
            }
        });
    }

    _trySendSubscription(model:MessagingModel, state:OperationState):void {
        // when not connected
        if (!model.isConnected ) {
            if (state.waitForConnection) {
                _log.debug(`Not connected but will wait for operation [${state.description}]. Waiting for connection.`);
            } else {
                _log.debug(`Not connected and not waiting, setting error for operation [${state.description}].`);
                state.error = new Error('Connection disconnect');
            }
            return;
        }

        // when connected but waiting for service connection
        let operationConfig : OperationConfig = model.serviceInstanceMonitor.getOperationConfig(state.serviceType, state.operationName);
        if(!operationConfig) {
            if (state.waitForConnection) {
                _log.debug(`Connected but service isn't, will wait for operation [${state.description}].`);
            } else {
                _log.debug(`Connected but service isn't and not waiting, setting error for operation [${state.description}].`);
                state.error = new Error('Connected but service isn\'t and not waiting');
            }
            return;
        }

        // when connected, and service connected, but not yet authenticated
        if(operationConfig.requiresAuthentication && !model.isAuthenticated) {
            _log.debug(`Can't yet send request for [${state.description}]. Operation requires authentication but model isn't yet authenticated.`);
            return;
        }

        // When connected and have available service, and if required, is authenticated
        state.setActive(
            model.sessionId, // if available set sessionId
            operationConfig
        );

        if (operationConfig.operationType == OperationType.stream || operationConfig.operationType == OperationType.requestStream) { //tslint:disable-line
            let responseDestination = (<StreamOperationConfig>operationConfig).getResponseDestination(model.sessionId);
            _log.debug(`[${state.description}] subscribing to responseDestination ${responseDestination}`);
            if(operationConfig.operationType == OperationType.requestStream) { //tslint:disable-line
                Guard.isString(state.correlationId, `Request stream requires a correlation id. ${state.description}`);
            }
            state.subscription = this._rabbitMqGateway.subscribe(
                state.correlationId,
                responseDestination,
                operationConfig.operationName
            );
        }
        if (operationConfig.operationType == OperationType.rpc || operationConfig.operationType == OperationType.requestStream) {//tslint:disable-line
            let headers, replyToLog = 'N/A';
            if (operationConfig.operationType == OperationType.rpc) { //tslint:disable-line
                // the broker will auto generate and manage a real queue for anything starting with '/temp-queue',
                // give this we can fire and forget and rely on the server setting the correlationId on the response,
                // we'll handle the response like any other, i.e. match the operation against it's correlationId.
                // Note we use an id that is unique to the current mq connection, not session or user.
                // This should change on disconnect/reconnect to mq and/or browser refresh
                let replyTo = `/temp-queue/${model.connectionId}`;
                headers = {
                    'reply-to': replyTo,
                    'content-type': 'text/plain'
                };
                replyToLog = ` reply-to: [${replyTo}]`;
            }
            let requestDestination = (<RpcOperationConfig>operationConfig).requestDestination;
            _log.debug(`[${state.description}] sending to destination ${requestDestination}. ReplyTo: [${replyToLog}]`);
            this._rabbitMqGateway.send(
                requestDestination,
                headers,
                state.createRequestDto()
            );
        }
    }
}