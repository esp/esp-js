import * as _ from 'lodash';
import {Logger} from '../../core';
import OperationConfig from './operations/operationConfig';

export default class ServiceInstanceDetails {
    private _serviceId:string;
    private _serviceType:string;
    private _operationConfigs:Array<OperationConfig>;
    private _operationConfigByOperationName:{};
    private _lastUpdateTimestamp:number;
    private _isSelected: boolean;
    private _isConnected : boolean;
    private _log:Logger;

    static get SERVICE_HEARTBEAT_TIMEOUT_MS() : number {
        return 10000; // 10 seconds
    }

    constructor(serviceId:string, serviceType:string, operationConfig:Array<OperationConfig>, lastUpdateTimestamp:number) {
        this._serviceId = serviceId;
        this._serviceType = serviceType;
        this._operationConfigs = operationConfig;
        this._lastUpdateTimestamp = lastUpdateTimestamp;
        this._isConnected = true;
        this._isSelected = false;
        this._operationConfigByOperationName = {};
        _.forEach(operationConfig, config => {
            this._operationConfigByOperationName[config.operationName] = config;
        });
        this._log = Logger.create(`ServiceDetails:${this._serviceType}:${this._serviceId}`);
    }

    get serviceId():string {
        return this._serviceId;
    }

    get serviceType():string {
        return this._serviceType;
    }

    get isConnected() {
        return this._isConnected;
    }

    get operationConfigs():Array<OperationConfig> {
        return this._operationConfigs;
    }

    get lastUpdateTimestamp():number {
        return this._lastUpdateTimestamp;
    }

    /**
     * true if the client is 'stuck' to this service instance
     * @returns {boolean}
     */
    get isSelected():boolean {
        return this._isSelected;
    }

    setDisconnected() : void {
        this._isConnected = false;
        this._lastUpdateTimestamp = null;
    }

    updateReceived(timestamp:number) : void {
        this._isConnected = true;
        this._lastUpdateTimestamp = timestamp;
    }

    getOperationConfig(name:string) : OperationConfig {
        return this._operationConfigByOperationName[name];
    }

    updateIsConnected(currentTime:number) : void {
        let lastSeenMs : number = Math.abs(currentTime - this._lastUpdateTimestamp);
       // this._log.debug(`last seen ms ${lastSeenMs}`);
        let isConnected2 = lastSeenMs < ServiceInstanceDetails.SERVICE_HEARTBEAT_TIMEOUT_MS;
        this._isConnected = isConnected2;
    }

    setSelected(isSelected: boolean) : void {
        this._isSelected = isSelected;
    }
}
