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
import {Consts} from './const';

export interface EventContext {
    readonly currentStage: string;
    readonly eventType: string;
    readonly isCanceled: boolean;
    readonly isCommitted: boolean;
    cancel(): void;
    commit(): void;
}

export class DefaultEventContext implements EventContext {
    private _modelId: string;
    private _eventType: string;
    private _isCanceled: boolean;
    private _isCommitted: boolean;
    private _currentStage: ObservationStage;

    public constructor(modelId, eventType) {
        this._modelId = modelId;
        this._eventType = eventType;
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
            throw 'event [' + this._eventType + '] for model [' + this._modelId + '] is already committed';
        }
    }
}

export class ModelChangedEventContext implements EventContext {
    public get currentStage(): string {
        return ObservationStage.normal;
    }
    public get eventType(): string {
        return Consts.modelChangedEvent;
    }
    public get isCanceled(): boolean {
        return false;
    }
    public get isCommitted(): boolean {
        return false;
    }
    public cancel(): void {
        throw new Error(`You can not cancel event of type ${this.eventType}`);
    }

    public commit(): void {
        throw new Error(`You can not commit event of type ${this.eventType}`);
    }
}