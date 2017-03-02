import { DisposableBase, SingleModelRouter } from 'esp-js';
import { ISchedulerService } from '../../core/schedulerService';
import { EventConst, RabbitMqDisconnectedEvent, RabbitMqMessageReceivedEvent } from '../events';
import Logger from '../../core/logger';
import Guard from '../../core/guard';
import MessagingModel from '../model/messagingModel';
import {IRabbitMqConnectionProxy} from './iRabbitMqConnectionProxy';
import AnyDtoMapper from '../anyDtoMapper';
import {Message} from 'google-protobuf';
import * as dtos from '../lib/dtos/service-common-contracts_pb';
import {MessageEnvelopeDto} from '../lib/dtos/service-common-contracts_pb';

const _log:Logger = Logger.create('RabbitMqGateway');

/**
 * A very thin shim over the RabbitMqConnectionProxy that owns the RabbitMqConnectionProxy and can recreate if it dies.
 * Can be used by multiple model entities to talk to rabbit.
 */
export default class RabbitMqGateway extends DisposableBase {
    private _router:SingleModelRouter<MessagingModel>;
    private _rabbitmqFactory:()=>IRabbitMqConnectionProxy;
    private _rabbitmq:IRabbitMqConnectionProxy;
    private _schedulerService : ISchedulerService;

    constructor(router:SingleModelRouter<MessagingModel>, rabbitmqFactory:() => IRabbitMqConnectionProxy, schedulerService:ISchedulerService) {
        super();
        Guard.isDefined(router, 'router required');
        Guard.isDefined(rabbitmqFactory, 'rabbitmqFactory required');
        Guard.isDefined(schedulerService, 'schedulerService required');
        this._router = router;
        this._rabbitmqFactory = rabbitmqFactory;
        this._schedulerService = schedulerService;
    }

    connect():void {
        this._bounceConnection();
    }

    disconnect():void {
        _log.info('disconnecting');
        this._rabbitmq.disconnect(() => {
            _log.info('Disconnected');
            this._cleanupRabbit();
            this._router.publishEvent(EventConst.rabbitMqDisconnectedEvent, new RabbitMqDisconnectedEvent(true));
        });
    }

    // direct pass through to the current proxy instance
    send(destination:string, headers:Array<string>, messageEnvelopeDto:dtos.MessageEnvelopeDto) : void {
        _log.debug(`sending to  destination ${destination}.`, messageEnvelopeDto.toObject());
        this._rabbitmq.send(destination, headers, messageEnvelopeDto);
    }

    // direct pass through to the current proxy instance
    subscribe(correlationId:string, responseDestination:string, description:string, headers?:Array<string>):{
        id : string,
        unsubscribe: () => void
    } {
        _log.verbose(`subscribe to response destination ${responseDestination}. correlationId: ${correlationId}`);
        let subscription = this._rabbitmq.subscribe(
            responseDestination,
            (dto:MessageEnvelopeDto) => {
                _log.verbose(`Message on response destination ${responseDestination} received. correlationId: ${correlationId}`);
                this._onMessageReceived(dto, correlationId);
            },
            description,
            headers
        );
        return subscription;
    }

    _bounceConnection():void {
        if(this._rabbitmq) {
            throw new Error('rabbit proxy already created');
        }
        _log.debug('Bouncing connection');
        this._rabbitmq = this._rabbitmqFactory();
        _log.debug(`new client proxy id [${this._rabbitmq.proxyId}]`);
        this._rabbitmq.onConnect(() => {
            _log.debug(`Connected. Is client connected: [${this._rabbitmq.isConnected}]. Proxy id [${this._rabbitmq.proxyId}]`);
            this._router.publishEvent(EventConst.rabbitMqConnectedEvent, {});
        });
        this._rabbitmq.onError(error => {
            // note stomp js can call this multiple times.
            // For example, if you get a disconnect frame from the server it's an error,
            // it then closes the web socket then that again calls this with a different message.
            // Basically we need to protect against that here by disposing our wrapper it.
            _log.error('Error', error);
            this._cleanupRabbit();
            this._router.publishEvent(EventConst.rabbitMqDisconnectedEvent, new RabbitMqDisconnectedEvent(false));
        });
        // As documented in the rabbitMqConnectionProxy (read that too!), this handler receives messages in 2 instances:
        // 1) For rpc responses
        // 2) For old subscriptions whereby the client un subscribed but the server had messages on the wire
        this._rabbitmq.onReceive(dto => {
            // for #2 we need to discard the message here.
            // anything without a correlation id can be discarded
            if(dto.getCorrelationId()) {
                this._onMessageReceived(dto);
            } else {
                _log.warn('Dropping message as it was received on the RPC channel but had no correlation id. Likely because it was a response already on the wire when the subscription was disposed.', dto);
            }
        });
        this._rabbitmq.connect();
    }

    _cleanupRabbit() {
        this._rabbitmq.dispose();
        this._rabbitmq = null;
    }

    _onMessageReceived(dto:MessageEnvelopeDto, correlationId:string = null) {
        _log.verbose(`Message received correlationId: ${correlationId}`);
        //unwrap the innter payloads message to it's proper proto message type
        let message:Message = null, payloadDto = dto.getPayload();
        if(payloadDto) {
            message = AnyDtoMapper.mapFromAnyDto(dto.getPayload());
        }
        let event = new RabbitMqMessageReceivedEvent(
            dto.getCorrelationId() || correlationId, // for streams the correlationId is all client side
            message,
            typeof dto.getError() != 'undefined' && dto.getError() //tslint:disable-line
                ? new Error(dto.getError())
                : undefined,
            dto.getHasCompleted() || false
        );
        this._router.publishEvent(EventConst.rabbitMqMessageReceivedEvent, event);
    }
}