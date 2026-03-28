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

import {Guard} from '../system';
import {Status} from './status';
import {StoreRecord} from './storeRecord';

// note: perhaps some validation on state transition could be added here, but the tests cover most edges cases already
export class State {
    private _currentStatus: string;
    private _eventsDispatched: any[];
    private _currentStoreId: string;
    private _currentStoreRecord: StoreRecord;
    private _circularEventDispatchLimit = 10000;
    private _currentDispatchCount = 0;
    private _pendingEffects: any[];

    public constructor() {
        this._currentStatus = Status.Idle;
        this._eventsDispatched = [];
        this._pendingEffects = [];
    }

    public get currentStatus(): Status {
        return this._currentStatus;
    }

    public get currentStoreId(): string {
        return this._currentStoreId;
    }

    public get currentStoreRecord(): StoreRecord {
        return this._currentStoreRecord;
    }

    public get eventsProcessed(): string[] {
        return this._eventsDispatched;
    }

    public get pendingEffects(): any[] {
        return this._pendingEffects;
    }

    public moveToIdle() {
        this._currentStatus = Status.Idle;
        this._clear();
        this._currentDispatchCount = 0;
    }

    public moveToPreProcessing(storeId: string, storeRecord: StoreRecord) {
        Guard.isString(storeId, 'storeId should be a string');
        Guard.isDefined(storeRecord, 'storeRecord should be defined');
        this._currentStoreId = storeId;
        this._currentStoreRecord = storeRecord;
        this._currentStatus = Status.PreEventProcessing;
    }

    public moveToEventDispatch() {
        this._currentDispatchCount++;
        if (this._currentDispatchCount >= this._circularEventDispatchLimit) {
            throw new Error(`Circular event dispatch detected, dispatch loop halted. ${this._currentDispatchCount}.`);
        }
        this._currentStatus = Status.EventProcessorDispatch;
    }

    public moveToPostProcessing() {
        this._currentStatus = Status.PostProcessing;
    }

    public executeEvent(executeAction: () => void) {
        let canMove = this._currentStatus === Status.PreEventProcessing || this._currentStatus === Status.EventProcessorDispatch || this._currentStatus === Status.PostProcessing;
        Guard.isTruthy(canMove, 'Can\'t move to executing as the current state ' + this._currentStatus + ' doesn\'t allow it');
        let previousStatus = this._currentStatus;
        this._currentStatus = Status.EventExecution;
        executeAction();
        this._currentStatus = previousStatus;
    }

    public moveToEffectsProcessing() {
        this._currentStatus = Status.EffectsProcessing;
    }

    public moveToDispatchModelUpdates() {
        this._currentStatus = Status.DispatchModelUpdates;
    }

    public moveToHalted() {
        this._currentStatus = Status.Halted;
        this._clear();
    }

    public clearEventDispatchQueue() {
        this._eventsDispatched = [];
    }

    public clearPendingEffects() {
        this._pendingEffects = [];
    }

    private _clear() {
        this._currentStoreId = undefined;
        this._currentStoreRecord = undefined;
        this.clearEventDispatchQueue();
        this.clearPendingEffects();
    }
}