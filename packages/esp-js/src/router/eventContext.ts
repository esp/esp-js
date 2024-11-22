// notice_start
/*
 * Copyright 2015 Dev Shop Limited
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

import {ObservationStage} from './observationStage';

export interface EventContext {
    /**
     * The model ID the event was delivered to.
     */
    modelId: string;
    /**
     * The current state in the dispatch loop
     */
    readonly currentStage: ObservationStage;
    /**
     * The type of event.
     */
    readonly eventType: string;
    /**
     * True if the event has been canceled.
     */
    readonly isCanceled: boolean;
    /**
     * True if the event has been committed.
     */
    readonly isCommitted: boolean;
    /**
     * If the event was published using an entityKey, this will be that key.
     */
    readonly entityKey: string;
    /**
     * Can be called to cancel further propagation of the event.
     */
    cancel(): void;
    /**
     * Can be called to commit the event allowing handlers subscribed at the commit stage to receive it.
     */
    commit(): void;
}

export class DefaultEventContext implements EventContext {
    private _modelId: string;
    private _eventType: string;
    private _entityKey: string;
    private _isCanceled: boolean;
    private _isCommitted: boolean;
    private _currentStage: ObservationStage;

    public constructor(modelId: string, eventType: string, entityKey: string) {
        this._modelId = modelId;
        this._eventType = eventType;
        this._entityKey = entityKey;
        this._isCanceled = false;
        this._isCommitted = false;
        this._currentStage = ObservationStage.preview; // initial state
    }

    get currentStage(): ObservationStage {
        return this._currentStage;
    }

    get eventType() {
        return this._eventType;
    }

    get modelId() {
        return this._modelId;
    }

    get entityKey() {
        return this._entityKey;
    }

    public updateCurrentState(newState: ObservationStage) {
        this._currentStage = newState;
    }

    get isCanceled() {
        return this._isCanceled;
    }

    get isCommitted() {
        return this._isCommitted;
    }

    cancel() {
        if (!this._isCanceled) {
            this._isCanceled = true;
        } else {
            throw new Error('event [' + this._eventType + '] for model [' + this._modelId + '] is already cancelled');
        }
    }

    commit() {
        if (!this._isCommitted) {
            this._isCommitted = true;
        } else {
            throw new Error('event [' + this._eventType + '] for model [' + this._modelId + '] is already committed');
        }
    }
}
