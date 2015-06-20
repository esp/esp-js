// notice_start
/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import { Guard } from '../system';

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
            throw new Error('event is already cancelled');
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
