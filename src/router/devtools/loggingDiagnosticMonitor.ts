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

import {logging} from '../../system';
import {DiagnosticMonitor} from './diagnosticMonitor';
import {DisposableBase} from '../../system/disposables/DisposableBase';

let _log = logging.Logger.create('LoggingDiagnosticMonitor');

/**
 * Handy for debugging if in node or via unit tests, else use esp-js-devtools.
 *
 * Note this only monitors the current dispatch loop.
 */
export class LoggingDiagnosticMonitor extends DisposableBase implements DiagnosticMonitor {
    private _currentDepth: number;
    private _steps: string[];

    constructor() {
        super();
        this._currentDepth = -1;
        this._steps = [];
    }

    getSummary() {
        return this._steps.join('\r\n');
    }

    addModel(modelId) {
    }

    removeModel(modelId) {
    }

    publishEvent(modelId, eventType) {
        this._pushStep(`[PublishEvent]:${modelId}:${eventType}`);
    }

    broadcastEvent(eventType) {
        this._pushStep(`[BroadcastEvent]:${eventType}`);
    }

    executingEvent(eventType) {
        this._pushStep(`[ExecutingEvent]:${eventType}`);
    }

    runAction(modelId) {
        this._pushStep(`[RunAction]:${modelId}`);
    }

    eventEnqueued(modelId, eventType) {
        this._incrementDepth();
        this._pushStep(`[EventEnqueued]:${modelId}:${eventType}`);
        this._decrementDepth();
    }

    eventIgnored(modelId, eventType) {
        this._incrementDepth();
        this._pushStep(`[EventIgnored(no observers)]:${modelId}:${eventType}`);
        this._decrementDepth();
    }

    dispatchLoopStart() {
        this._incrementDepth();
        this._pushStep(`[DispatchLoopStart]`);
    }

    startingModelEventLoop(modelId, initiatingEventType) {
        this._incrementDepth();
        this._pushStep(`[StartingModelEventLoop]${modelId}, InitialEvent: ${initiatingEventType}`);
    }

    preProcessingModel() {
        this._incrementDepth();
        this._pushStep(`[PreProcessingModel]`);
    }

    dispatchingEvents() {
        this._incrementDepth();
        this._pushStep(`[DispatchingEvents]`);
        this._incrementDepth();
    }

    dispatchingAction() {
        this._pushStep(`[DispatchingAction]`);
    }

    dispatchingEvent(eventType, stage) {
        this._pushStep(`[DispatchingEvent] ${eventType} ${stage}`);
    }

    dispatchingViaDirective(functionName) {
        this._incrementDepth();
        this._pushStep(`[DispatchingViaDirective] Handler Function: ${functionName}`);
        this._decrementDepth();
    }

    dispatchingViaConvention(functionName) {
        this._incrementDepth();
        this._pushStep(`[DispatchingViaConvention] Handler Function: ${functionName}`);
        this._decrementDepth();
    }

    finishDispatchingEvent() {
        this._decrementDepth();
        this._pushStep(`[FinishDispatchingEvent]`);
        this._decrementDepth();
    }

    postProcessingModel() {
        this._pushStep(`[PostProcessingModel]`);
        this._decrementDepth();
    }

    endingModelEventLoop() {
        this._pushStep(`[EndingModelEventLoop]`);
        this._decrementDepth();
    }

    dispatchingModelUpdates(modelId) {
        this._pushStep(`[DispatchingModelUpdates] ${modelId}`);
    }

    dispatchLoopEnd() {
        this._decrementDepth();
        this._pushStep(`[DispatchLoopEnd]`);
    }

    halted(modelIds, err) {
        this._pushStep(`[Halted] ${modelIds}`);
        this._pushStep(err);
        _log.error('\r\n' + this.getSummary());
    }

    _incrementDepth() {
        this._currentDepth++;
        if (this._currentDepth === 0) {
            this._steps = []; // reset
        }
    }

    _decrementDepth() {
        this._currentDepth--;
    }

    _pushStep(stepMessage) {
        this._steps.push(this._padSpaces(this._currentDepth) + stepMessage);
    }

    _padSpaces(length) {
        let spaces = ' ', i;
        for (i = 0; i < length; i++) {
            spaces += '  ';
        }
        return spaces;
    }
}