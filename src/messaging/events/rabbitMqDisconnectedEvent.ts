export default class RabbitMqDisconnectedEvent {
    private _wasManualDisconnect:boolean;

    constructor(wasManualDisconnect: boolean) {
        this._wasManualDisconnect = wasManualDisconnect || false;
    }

    get wasManualDisconnect(): boolean {
        return this._wasManualDisconnect;
    }
}
