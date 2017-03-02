import OperationState from './operationState';

/**
 * 'immutable' version of internal messaging state
 */
export default class MessageOperation {
    _operationState:OperationState;

    constructor(operationState:OperationState) {

        this._operationState = operationState;
    }

    get correlationId():string {
        return this._operationState.correlationId;
    }

    get serviceType():string {
        return this._operationState.serviceType;
    }

    get operationName():string {
        return this._operationState.operationName;
    }

    get hasResult():boolean {
        return this._operationState.result !== undefined;
    }

    get result():Object {
        return this._operationState.result;
    }

    get hasError():boolean {
        return this._operationState.error !== undefined;
    }

    get error():Error {
        return this._operationState.error;
    }

    get isCompleted():boolean {
        return this._operationState.isCompleted;
    }
}
