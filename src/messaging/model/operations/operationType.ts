export default class OperationType {
    static get stream(): string {
        return 'Stream';
    }

    static get requestStream(): string {
        return 'RequestStream';
    }

    static get rpc(): string {
        return 'RPC';
    }
}
