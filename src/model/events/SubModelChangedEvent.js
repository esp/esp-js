class SubModelChangedEvent {
    constructor(childModelId, eventType) {
        this._childModelId = childModelId;
        this._eventType = eventType;
    }
    get childModelId() {
        return this._childModelId;
    }
    get eventType() {
        return this._eventType;
    }
}
export default SubModelChangedEvent;