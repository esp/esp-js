import Guard from '../../core/guard';

export default class RabbitMqMessageReceivedEvent {
    private _correlationId:string;
    private _payload:any;
    private _error:Error;
    private _isCompleted:boolean;

    constructor(correlationId:string, payload:any, error:Error, isCompleted:boolean) {
        Guard.stringIsNotEmpty(correlationId, 'correlationId required');
        Guard.isDefined(payload, 'payload required');
        Guard.isDefined(isCompleted, 'isCompleted required');
        this._correlationId = correlationId;
        this._payload = payload;
        this._error = error;
        this._isCompleted = isCompleted;
    }

    get correlationId():string {
        return this._correlationId;
    }

    get payload():any {
        return this._payload;
    }

    get error():Error {
        return this._error;
    }

    get isCompleted():boolean {
        return this._isCompleted;
    }
}
