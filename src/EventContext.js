"use strict";

import Guard from './Guard';

class EventContext {
    constructor(modelId, eventType, event) {
        Guard.isString(modelId, "The modelId should be a string");
        Guard.isString(eventType, "The eventType should be a string");
        Guard.isDefined(event, "The event should be defined");
        this._modelId = modelId;
        this._eventType = eventType;
        this._event = event;
        this._isCanceled = false;
        this._isCommitted = false;
    }
    get isCanceled() {
        return this._isCanceled;
    }
    get isCommitted() {
        return this._isCommitted;
    }
    get modelId() {
        return this._modelId;
    }
    get event() {
        return this._event;
    }
    get eventType() {
        return this._eventType;
    }
    cancel() {
        if(!this._isCanceled) {
            this._isCanceled = true;
        } else {
            throw 'event is already canceled';
        }
    }
    commit() {
        if(!this._isCommitted) {
            this._isCommitted = true;
        } else {
            throw 'event is already committed';
        }
    }
}

export default EventContext;
