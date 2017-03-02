export default class StreamDisposedEvent {
    private _correlationId : string;
    private _serviceType : string;
    private _operationName : string;

    constructor(correlationId:string,  serviceType:string, operationName:string) {
        this._correlationId = correlationId;
        this._serviceType = serviceType;
        this._operationName = operationName;
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
}
