// this puts Stomp on window. Our type defs export a var to window
import 'script!../lib/stompjs/stomp.js';
import * as SockJS from 'sockjs-client';
import Logger from '../../core/logger';
import {IRabbitMqConnectionProxy} from './iRabbitMqConnectionProxy';
import * as dtos from '../lib/dtos/service-common-contracts_pb';
const jspb = require('google-protobuf');

let PROXY_ID = 1;
const _log:Logger = Logger.create('RabbitMqConnectionProxy');

export default class RabbitMqConnectionProxy implements IRabbitMqConnectionProxy {
    private _userName:string;
    private _password:string;
    private _wsUrl:string;
    private _vHost:string;
    private _isDisposed:boolean;
    private _client:StompJs.Client;
    private _onConnect:() => void;
    private _onError:(errorMessage:string) => void;
    private _onReceive:(message:dtos.MessageEnvelopeDto) => void;
    private _proxyId:string;

    constructor() {
        // these never change so hardcoding them.
        // If they have to move, then the _wsUrl still needs to be dynamic
        // i.e. can't hardcode localhost
        this._userName = 'webuser';
        this._password = 'webpassword';
        this._wsUrl = 'http://' + window.location.hostname + ':15674/stomp';
        this._vHost = '/web';
        this._proxyId = String(PROXY_ID++);
        this._isDisposed = false;
        _log.debug(`Creating, Id[${this._proxyId}]`);
    }

    connect() {
        this._throwIfDisposed();
        _log.debug(`Connect, Id[${this._proxyId}]`);
        let ws = new SockJS(this._wsUrl);
        this._client = Stomp.over(ws);
        // this might be fixed now, TODO check https://github.com/sockjs/sockjs-protocol/wiki/Heartbeats-and-SockJS:
        // SockJS does not support heart-beat: disable heart-beats
        this._client.heartbeat.outgoing = 0;
        this._client.heartbeat.incoming = 0;
        this._client.connect(
            this._userName,
            this._password,
            () => {
                if (this._onConnect) {
                    this._onConnect();
                }
            },
            error => {
                _log.error(`Disconnected ${this._proxyId}`);
                if (this._onError) {
                    this._onError(error);
                }
            },
            this._vHost
        );
        // note this callback is used for :
        // 1) RPC, the stomp js lib just pushes anything that was to temp queues to this handler
        // 2) rouge messages: when you've un subscribed from a queue yet there is
        //    some undelivered messages, they'll end up coming here
        this._client.onreceive = (response: StompJs.Message)=> {
            let messageResponseDto = this._getEnvelope(response);
            if (this._onReceive) {
                // for point #2 we still forward responses into the system, let the messaging layer deal with it
                this._onReceive(messageResponseDto);
            }
        };
        this._client.debug = message => {
            _log.verbose(message);
        };
    }

    get proxyId() {
        return this._proxyId;
    }

    get isConnected() {
        return this._client.connected;
    }

    /**
     * Disconnects a client
     * @param callback
     */
    disconnect(callback:() => void) {
        this._throwIfDisposed();
        this._client.disconnect(() => {
            if (callback) {
                callback();
            }
        });
    }

    onConnect(callback:() => void) {
        this._throwIfDisposed();
        this._onConnect = callback;
    }

    onReceive(callback:(message:dtos.MessageEnvelopeDto) => void) {
        this._throwIfDisposed();
        this._onReceive = callback;
    }

    // error is an error frame: http://stomp.github.io/stomp-specification-1.1.html#ERROR
    onError(callback:(errorMessage:string) => void) {
        this._throwIfDisposed();
        this._onError = callback;
    }

    send(destination:string, headers:Array<any>, dto:dtos.MessageEnvelopeDto) {
        this._throwIfDisposed();
        let envelopeDtoBinaryAsB64 = jspb.Message.bytesAsB64(dto.serializeBinary());
        this._client.send(
            destination,
            headers,
            envelopeDtoBinaryAsB64
        );
    }

    subscribe(destination:string,
              onMessageCallback:(message:dtos.MessageEnvelopeDto) => void,
              description:string,
              headers?:Array<string>) {
        this._throwIfDisposed();
        return this._client.subscribe(
            destination,
            response => {
                let messageResponseDto = this._getEnvelope(response);
                onMessageCallback(messageResponseDto);
            },
            headers,
            description
        );
    }

    // required as stomp JS has some strange behaviour.
    // For example, if you get a disconnect frame from the server it's an error (calls _onError),
    // it then closes the web socket then that again calls _onError this with a different message.
    dispose() {
        this._throwIfDisposed();
        this._isDisposed = true;
        this._onConnect = null;
        this._onError = null;
        this._onReceive = null;
        if (this._client) {
            if (this._client.connected) {
                this._client.disconnect();
            }
            this._client = null;
        }
    }

    _throwIfDisposed() {
        if (this._isDisposed) {
            throw new Error('Mq proxy has been disposed');
        }
    }

    _getEnvelope(response:any) : dtos.MessageEnvelopeDto {
        let envelopeDto = <dtos.MessageEnvelopeDto>dtos.MessageEnvelopeDto.deserializeBinary(response.body);
        return envelopeDto;
    }
}
