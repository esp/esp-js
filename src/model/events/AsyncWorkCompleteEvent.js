class AsyncWorkCompleteEvent {
    constructor(operationId, results, isFinished) {
        this._operationId = operationId;
        this._results = results;
        this._isFinished = isFinished;
    }
    get operationId() {
        return this._operationId;
    }
    get results() {
        return this._results;
    }
    get isFinished() {
        return this._isFinished;
    }
}
export default AsyncWorkCompleteEvent;