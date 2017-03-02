import * as _ from 'lodash';
import * as uuid from 'node-uuid';
import { DisposableBase, observeEvent, SingleModelRouter, ObservationStage } from 'esp-js';
import { EventConst, ServicesOfflineEvent } from '../events';
import { Guard } from '../../core';
import WellKnownDestinations from './wellKnownDestinations';
import { OperationType, StreamOperationConfig, RequestStreamOperationConfig, RpcOperationConfig } from './operations';
import RabbitMqGateway from '../gateways/rabbitMqGateway';
import { Logger, ISchedulerService } from '../../core';
import ConnectionStatus from './connectionStatus';
import ServiceStatus from './serviceStatus';
import RabbitMqMessageReceivedEvent from '../events/rabbitMqMessageReceivedEvent';
import ServiceInstanceDetails from './serviceInstanceDetails';
import OperationConfig from './operations/operationConfig';
import ServiceInstanceStatus from './serviceInstanceStatus';
import OperationStatus from './operationStatus';
import MessagingModel from './messagingModel';
import * as dtos from '../lib/dtos/service-common-contracts_pb';
import {OperationTypeDto} from '../lib/dtos/service-common-contracts_pb';

const _log:Logger = Logger.create('ServiceInstanceMonitor');

declare interface ServiceConfigByType {
    [serviceType: string] : ServiceInstanceDetailsById;
}

declare interface ServiceInstanceDetailsById {
    [serviceId: string] : ServiceInstanceDetails;
}

export default class ServiceInstanceMonitor extends DisposableBase {
    private _router:SingleModelRouter<MessagingModel>;
    private _rabbitMqGateway:RabbitMqGateway;
    private _heartbeatSubscription:{ unsubscribe() : void };
    private _statusCorrelationId:string;
    private _statusUpdated:boolean;
    private _schedulerService:ISchedulerService;
    private _serviceInstanceLookupByServiceType:ServiceConfigByType = {};

    constructor(router:SingleModelRouter<MessagingModel>,
                rabbitMqGateway:RabbitMqGateway,
                schedulerService:ISchedulerService) {
        super();
        Guard.isDefined(router, 'router required');
        Guard.isDefined(rabbitMqGateway, 'rabbitMqGateway required');
        this._router = router;
        this._rabbitMqGateway = rabbitMqGateway;
        this._statusCorrelationId = uuid.v4();
        this._serviceInstanceLookupByServiceType = {};
        this._schedulerService = schedulerService;
    }

    get statusUpdated() {
        return this._statusUpdated;
    }

    observeEvents():void {
        this.addDisposable(this._router.observeEventsOn(this));
    }

    preProcess() {
        this._statusUpdated = false;
    }

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
    getServiceStatus(serviceType:string):ConnectionStatus {
        let serviceConfig = this._serviceInstanceLookupByServiceType[serviceType];
        for (let instanceNameProp in serviceConfig) {
            if (serviceConfig.hasOwnProperty(instanceNameProp)) {
                let instanceDetails = serviceConfig[instanceNameProp];
                if (instanceDetails.isSelected) {
                    return instanceDetails.isConnected
                        ? ConnectionStatus.connected
                        : ConnectionStatus.disconnected;
                }
            }
        }
        return ConnectionStatus.disconnected;
    }

    /**
     * Returns an array of ServiceStatus which contains all informtaion relating to that service types connection status
     */
    getAllServiceStatus() : Array<ServiceStatus> {
        return _.map<ServiceInstanceDetailsById, ServiceStatus>(this._serviceInstanceLookupByServiceType, (serviceConfig:ServiceInstanceDetailsById, serviceType:string) => {
            let hasConnectedInstance = false;
            let instanceStatuses = _.map<ServiceInstanceDetails, ServiceInstanceStatus>(serviceConfig, (serviceInstanceDetails:ServiceInstanceDetails) => {
                if(!hasConnectedInstance && serviceInstanceDetails.isConnected) {
                    hasConnectedInstance = true;
                }
                let operationStatuses = _.map<OperationConfig, OperationStatus>(serviceInstanceDetails.operationConfigs, operationConfig => {
                    return new OperationStatus(operationConfig.operationName, operationConfig.isAvailable);
                });
                return new ServiceInstanceStatus(
                    serviceInstanceDetails.serviceType,
                    serviceInstanceDetails.serviceId,
                    serviceInstanceDetails.isConnected,
                    serviceInstanceDetails.isSelected,
                    operationStatuses
                );
            });
            return new ServiceStatus(
                serviceType,
                hasConnectedInstance,
                instanceStatuses
            );
        });
    }

    getOperationConfig(serviceType:string, operationName:string) : OperationConfig {
        let selectedInstance : ServiceInstanceDetails = this._getOrSetSelectedInstance(serviceType);
        if(selectedInstance) {
            return selectedInstance.getOperationConfig(operationName);
        } else {
            return;
        }
    }

    @observeEvent(EventConst.rabbitMqConnectedEvent)
    _onRabbitMqConnectedEvent():void {
        _log.info('Connected, starting status observation');
        this._heartbeatSubscription = this._rabbitMqGateway.subscribe(
            this._statusCorrelationId,
            WellKnownDestinations.heartbeat,
            'heartbeat'
        );
    }

    @observeEvent(EventConst.rabbitMqDisconnectedEvent, ObservationStage.committed)
    _onRabbitMqDisconnectedEvent(event):void {
        _log.info('Disconnected');
        this._forEachServiceInstance(serviceStatus => {
            serviceStatus.setDisconnected();
        });
    }

    @observeEvent(EventConst.rabbitMqMessageReceivedEvent)
    _onRabbitMqMessageReceivedEvent(event:RabbitMqMessageReceivedEvent):void {
        if (event.correlationId === this._statusCorrelationId) {
            _log.verbose('Service status received');
            let statusDto = <dtos.HeartbeatDto>event.payload;
            let serviceInstanceLookup : { [serviceId: string] : ServiceInstanceDetails }= this._serviceInstanceLookupByServiceType[statusDto.getServiceType()];
            if (!serviceInstanceLookup) {
                serviceInstanceLookup = {};
                this._serviceInstanceLookupByServiceType[statusDto.getServiceType()] = serviceInstanceLookup;
            }
            let serviceInstanceDetails:ServiceInstanceDetails = serviceInstanceLookup[statusDto.getServiceId()];
            if (serviceInstanceDetails) {
                let isDisconnected = !serviceInstanceDetails.isConnected;
                serviceInstanceDetails.updateReceived(this._schedulerService.async.now());
                _.forEach(statusDto.getOperationConfigDtosList(), configDto => {
                    let operationConfig = serviceInstanceDetails.getOperationConfig(configDto.getOperationName());
                    operationConfig.isAvailable = configDto.getIsAvailable();
                });
                if (isDisconnected && serviceInstanceDetails.isConnected) {
                    this._router.publishEvent(EventConst.serviceOnlineEvent, {});
                }
            } else {
                _log.info(`service type [${statusDto.getServiceType()}] id [${statusDto.getServiceId()}] has come online`);
                let operationConfigs = _(statusDto.getOperationConfigDtosList())
                    .map(configDto => this._mapOperationConfig(configDto))
                    .value();
                serviceInstanceDetails = new ServiceInstanceDetails(
                    statusDto.getServiceId(),
                    statusDto.getServiceType(),
                    operationConfigs,
                    this._schedulerService.async.now()
                );
                serviceInstanceLookup[statusDto.getServiceId()] = serviceInstanceDetails;
                this._router.publishEvent(EventConst.serviceOnlineEvent, {});
            }
            // Any time we get a service status we check to ensure that an instance is selected
            this._getOrSetSelectedInstance(statusDto.getServiceType());
            this._statusUpdated = true;
        }
    }

    // NOTES: when a selected instance goes offline the model tick needs to result in all service status streams yielding disconnected.
    // it does not need to mark a new instance as selected.
    // This means that on next tick, any request for that service type (status or actual operation) needs to re-instate a selected instance.
    // this way any initial interaction from outside the model for a service type sticks a service instance until it goes down, then all
    // the model needs to do when it goes away is mark it as unselected and disconnected. Next tick re-instates .

    @observeEvent(EventConst.timerEvent)
    _onTimerEvent():void {
        //  _log.debug('checking for offline services');
        let offlineServicesId = {}, hasOfflineServices = false;
        this._forEachServiceInstance(serviceInstanceDetails => {
            if (serviceInstanceDetails.isConnected) {
                serviceInstanceDetails.updateIsConnected(this._schedulerService.async.now());
                if (!serviceInstanceDetails.isConnected) {
                    hasOfflineServices = true;
                    _log.warn(`Services type [${serviceInstanceDetails.serviceType}:${serviceInstanceDetails.serviceId}] has gone offline.`);
                    offlineServicesId[serviceInstanceDetails.serviceId] = 'noop';
                    _.forEach(serviceInstanceDetails.operationConfigs, config => {
                        config.isAvailable = false;
                    });
                    if (serviceInstanceDetails.isSelected) {
                        serviceInstanceDetails.setSelected(false);
                    }
                }
            }
        });
        if (hasOfflineServices) {
            this._statusUpdated = true;
            this._router.publishEvent(
                EventConst.servicesOfflineEvent,
                new ServicesOfflineEvent(offlineServicesId)
            );
            this._removeDisconnectedInstances();
        }
    }

    _mapOperationConfig(configDto:dtos.OperationConfigDto):OperationConfig {
        switch (configDto.getOperationType()) { //tslint:disable-line
            case  OperationTypeDto.STREAM :
                return new StreamOperationConfig(
                    configDto.getServiceType(),
                    configDto.getOperationName(),
                    configDto.getServiceId(),
                    configDto.getResponseExchangeName(),
                    configDto.getResponseRoutingKey(),
                    configDto.getRequiresAuthentication(),
                    configDto.getIsAvailable()
                );
            case OperationTypeDto.REQUEST_STREAM :
                return new RequestStreamOperationConfig(
                    configDto.getServiceType(),
                    configDto.getOperationName(),
                    configDto.getServiceId(),
                    configDto.getRequestExchangeName(),
                    configDto.getRequestRoutingKey(),
                    configDto.getResponseExchangeName(),
                    configDto.getResponseRoutingKey(),
                    configDto.getRequiresAuthentication(),
                    configDto.getIsAvailable()
                );
            case OperationTypeDto.RPC :
                return new RpcOperationConfig(
                    configDto.getServiceType(),
                    configDto.getOperationName(),
                    configDto.getServiceId(),
                    configDto.getRequestExchangeName(),
                    configDto.getRequestRoutingKey(),
                    configDto.getRequiresAuthentication(),
                    configDto.getIsAvailable()
                );
        }
    }

    _forEachServiceInstance(callback:(instance:ServiceInstanceDetails) => void) {
        _.forOwn(this._serviceInstanceLookupByServiceType, lookup => {
            _.forOwn(lookup, (instance:ServiceInstanceDetails) => {
                callback(instance);
            });
        });
    }

    _getOrSetSelectedInstance(serviceType:string) : ServiceInstanceDetails {
        // Here we find a service instance that's already selected, or the next best one (i.e. next connected one)
        //
        // If the connection or service goes down other code will update it's isConnection status,
        // thus causing disconnections to observers of the model watching the status.
        //
        // The first retry operation to hit this method and we simply have to
        // de-select and re-select a new instance, if available.
        let serviceConfig = this._serviceInstanceLookupByServiceType[serviceType];
        let selectedInstance  = null, nextBestInstance = null;
        _.forOwn(serviceConfig, (instanceDetails:ServiceInstanceDetails) => {
            if (instanceDetails.isSelected) {
                if (!instanceDetails.isConnected) {
                    instanceDetails.setSelected(false);
                } else {
                    selectedInstance = instanceDetails;
                }
            }
            if (instanceDetails.isConnected) {
                nextBestInstance = instanceDetails;
            }
        });

        if (!selectedInstance) {
            selectedInstance = nextBestInstance;
        }

        if (!selectedInstance) {
            return;
        }

        if(!selectedInstance.isSelected) {
            selectedInstance.setSelected(true);
        }
        return selectedInstance;
    }

    _removeDisconnectedInstances() {
        _.forOwn(this._serviceInstanceLookupByServiceType, lookup => {
            _.forOwn(lookup, (instanceDetails:ServiceInstanceDetails) => {
                if(!instanceDetails.isConnected) {
                    _log.debug(`removing [${instanceDetails.serviceType}:${instanceDetails.serviceId}] as it's disconnected`);
                    _.unset(lookup, instanceDetails.serviceId);
                }
            });
        });
    }
}
