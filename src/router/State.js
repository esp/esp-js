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

import { Guard } from '../system';
import Status from './Status.js';

// note: perhaps some validation on state transition could be added here, but the tests cover most edges cases already
export default class State {
    constructor() {
        this._currentStatus = Status.Idle;
    }
    get currentStatus() {
        return this._currentStatus;
    }
    get currentModelId() {
        return this._currentModelId;
    }
    get currentModel() {
        return this._currentModel;
    }
    moveToIdle() {
        this._currentStatus = Status.Idle;
        this._clear();
    }
    moveToPreProcessing(modelId, model) {
        Guard.isString(modelId, 'The modelId should be a string');
        Guard.isDefined(model, 'The model should be defined');
        this._currentModelId = modelId;
        this._currentModel = model;
        this._currentStatus = Status.PreEventProcessing;
    }
    moveToEventDispatch() {
        this._currentStatus = Status.EventProcessorDispatch;
    }
    moveToPostProcessing() {
        this._currentStatus = Status.PostProcessing;
    }
    executeEvent(executeAction) {
        var canMove = this._currentStatus === Status.PreEventProcessing || this._currentStatus === Status.EventProcessorDispatch || this._currentStatus === Status.PostProcessing;
        Guard.isTrue(canMove, 'Can\'t move to executing as the current state ' + this._currentStatus + ' doesn\'t allow it');
        var previousStatus = this._currentStatus;
        this._currentStatus = Status.EventExecution;
        executeAction();
        this._currentStatus = previousStatus;
    }
    moveToDispatchModelUpdates() {
        this._currentStatus = Status.DispatchModelUpdates;
    }
    moveToHalted() {
        this._currentStatus = Status.Halted;
        this._clear();
    }
    _clear() {
        this._currentModelId = undefined;
        this._currentModel = undefined;
    }
}