export default class StreamRequestEvent {
    private _correlationId : string;
    private _serviceType : string;
    private _operationName : string;
    private _request : Object;
    private _waitForConnection:boolean;

    constructor(
        correlationId:string,
        serviceType:string,
        operationName:string,
        request:Object,
        waitForConnection:boolean
    ) {
        this._correlationId = correlationId;
        this._serviceType = serviceType;
        this._operationName = operationName;
        this._request = request;
        this._waitForConnection = waitForConnection;
    }

    get correlationId():string {
        return this._correlationId;
    }

    get serviceType():string {
        return this._serviceType;
    }

    get operationName():string {
        return this._operationName;
    }

    get request():Object {
        return this._request;
    }

    get hasRequest():boolean {
        return this._request !== undefined;
    }

    get waitForConnection():boolean {
        return this._waitForConnection;
    }
}
