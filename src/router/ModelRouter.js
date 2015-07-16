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

export default class ModelRouter {
    constructor(underlyingRouter, targetModelId) {
        this._underlying = underlyingRouter;
        this._targetModelId = targetModelId;
    }
    publishEvent(eventType, event) {
        this._underlying.publish(this._targetModelId, eventType, event);
    }
    executeEvent(eventType, event) {
        this._underlying.executeEvent(eventType, event);
    }
    getEventObservable(eventType, stage) {
        return this._getEventObservable(this._targetModelId, eventType, stage);
    }
    getModelObservable() {
        return this._getModelObservable(this._targetModelId);
    }
}
