export default class ConnectionStatus {
    private _name:string;

    static idle = new ConnectionStatus('idle');
    static connected = new ConnectionStatus('connected');
    static disconnected = new ConnectionStatus('disconnected');

    constructor(name: string) {
        this._name = name;
    }

    get name(): string {
        return this._name;
    }
}
