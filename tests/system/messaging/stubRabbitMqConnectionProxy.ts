import * as _ from 'lodash';
import * as dtos from "../../../src/messaging/lib/dtos/service-common-contracts_pb";
import {IRabbitMqConnectionProxy} from "../../../src/messaging/gateways/iRabbitMqConnectionProxy";

export default class StubRabbitMqConnectionProxy implements IRabbitMqConnectionProxy {
    private _disposedCount:number;
    private _isConnected:boolean;

    public connectCallCount:number;
    public onConnectCallbacks:Array<() => void>;
    public onReceiveCallbacks:Array<(message:dtos.MessageEnvelopeDto) => void>;
    public onErrorCallbacks:Array<(errorMessage:string) => void>;
    public sentMessages:Array<{ destination:string, headers:Array<string>, dto:dtos.MessageEnvelopeDto}>;
    public subscribes:{ [destination: string] : any; } = {};

    constructor() {
        this._init();
        this._disposedCount = 0;
    }

    get proxyId() {
        return '1';
    }

    get isConnected() {
        return this._isConnected;
    }

    connect() {
        this.connectCallCount++;
    }

    disconnect(callback:() => void) {
        callback();// just call right away, pretty much what stompjs does
    }

    onConnect(callback:() => void) {
        this.onConnectCallbacks.push(callback);
    }

    onReceive(callback:(message:dtos.MessageEnvelopeDto) => void) {
        this.onReceiveCallbacks.push(callback);
    }

    onError(callback:(errorMessage:string) => void) {
        this.onErrorCallbacks.push(callback);
    }

    send(destination:string, headers:Array<string>, dto:dtos.MessageEnvelopeDto) {
        this.sentMessages.push({
            destination,
            headers,
            dto
        });
    }
 
    subscribe(destination:string, onMessageCallback:(message:any) => void, description:string, headers?:Array<string>) {
        var subscription = {
            destination,
            onMessageCallback,
            headers,
            unsubscribeCallCount:0,
            unsubscribe() {
                this.unsubscribeCallCount++;
            },
            onResults(results) {
                this.onMessageCallback(results);
            }
        };
        this.subscribes[destination] = subscription;
        return subscription;
    }

    setIsConnected(isConnected) {
        this._isConnected = isConnected;
        if (isConnected) {
            _.forEach(this.onConnectCallbacks, onConnect => onConnect());
        } else {
            _.forEach(this.onErrorCallbacks, onError => onError('Test Connection Error'));
        }
    }

    dispose() {
        this._disposedCount++;
        this._init();
    }

    _init() {
        this.onConnectCallbacks = [];
        this.onReceiveCallbacks = [];
        this.connectCallCount = 0;
        this.onErrorCallbacks = [];
        this.sentMessages = [];
        this.subscribes = {};
        this._isConnected = false;
    }
}
