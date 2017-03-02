import * as Rx from 'rx';
import { DisposableBase } from 'esp-js';
import Connection from './connection';
import ConnectionStatus from './model/connectionStatus';

export default class ServiceBase extends DisposableBase  {
    private _serviceType:string;
    protected _connection:Connection;
    private _serviceStatusStream:Rx.Observable<ConnectionStatus>;

    constructor(serviceType:string, connection:Connection) {
        super();
        this._serviceType = serviceType;
        this._connection = connection;
        this._serviceStatusStream = connection
            .serviceStatusStream(serviceType)
            .replay(null, 1)
            .refCount();
    }

    get connectionStatus() : Rx.Observable<ConnectionStatus> {
        return this._serviceStatusStream;
    }
}
