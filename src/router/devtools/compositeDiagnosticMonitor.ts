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
import {DisposableBase} from '../../system/disposables';
import {DevToolsDiagnosticMonitor} from './devToolsDiagnosticMonitor';
import {LoggingDiagnosticMonitor} from './loggingDiagnosticMonitor';
import {NoopDiagnosticMonitor} from './noopDiagnosticMonitor';
import {DiagnosticMonitor} from './diagnosticMonitor';

export class CompositeDiagnosticMonitor extends DisposableBase implements DiagnosticMonitor {
    private _devToolsDiagnostic: DiagnosticMonitor;
    private _currentLoggingDiagnosticMonitor: DiagnosticMonitor;
    private _enableDiagnosticLogging = false;

    constructor() {
        super();
        this._devToolsDiagnostic = new DevToolsDiagnosticMonitor();
        this._currentLoggingDiagnosticMonitor = new NoopDiagnosticMonitor();
        this.addDisposable(this._devToolsDiagnostic);
    }

    getSummary() {
        return this._currentLoggingDiagnosticMonitor.getSummary();
    }

    getLoggingDiagnosticSummary() {
        return this._currentLoggingDiagnosticMonitor.getSummary();
    }

    public get enableDiagnosticLogging() {
        return this._enableDiagnosticLogging;
    }

    public set enableDiagnosticLogging(isEnabled: boolean) {
        if (isEnabled) {
            this._enableDiagnosticLogging = true;
            this._currentLoggingDiagnosticMonitor = new LoggingDiagnosticMonitor();
        } else {
            this._enableDiagnosticLogging = false;
            this._currentLoggingDiagnosticMonitor = new NoopDiagnosticMonitor();
        }
    }

    public addModel(modelId) {
        this._currentLoggingDiagnosticMonitor.addModel(modelId);
        this._devToolsDiagnostic.addModel(modelId);
    }

    removeModel(modelId) {
        this._currentLoggingDiagnosticMonitor.removeModel(modelId);
        this._devToolsDiagnostic.removeModel(modelId);
    }

    publishEvent(modelId, eventType, event) {
        this._currentLoggingDiagnosticMonitor.publishEvent(modelId, eventType, event);
        this._devToolsDiagnostic.publishEvent(modelId, eventType, event);
    }

    broadcastEvent(eventType) {
        this._currentLoggingDiagnosticMonitor.broadcastEvent(eventType);
        this._devToolsDiagnostic.broadcastEvent(eventType);
    }

    executingEvent(eventType) {
        this._currentLoggingDiagnosticMonitor.executingEvent(eventType);
        this._devToolsDiagnostic.executingEvent(eventType);
    }

    runAction(modelId) {
        this._currentLoggingDiagnosticMonitor.runAction(modelId);
        this._devToolsDiagnostic.runAction(modelId);
    }

    eventEnqueued(modelId, eventType) {
        this._currentLoggingDiagnosticMonitor.eventEnqueued(modelId, eventType);
        this._devToolsDiagnostic.eventEnqueued(modelId, eventType);
    }

    dispatchLoopStart() {
        this._currentLoggingDiagnosticMonitor.dispatchLoopStart();
        this._devToolsDiagnostic.dispatchLoopStart();
    }

    startingModelEventLoop(modelId, initiatingEventType) {
        this._currentLoggingDiagnosticMonitor.startingModelEventLoop(modelId, initiatingEventType);
        this._devToolsDiagnostic.startingModelEventLoop(modelId, initiatingEventType);
    }

    preProcessingModel() {
        this._currentLoggingDiagnosticMonitor.preProcessingModel();
        this._devToolsDiagnostic.preProcessingModel();
    }

    dispatchingEvents() {
        this._currentLoggingDiagnosticMonitor.dispatchingEvents();
        this._devToolsDiagnostic.dispatchingEvents();
    }

    dispatchingAction() {
        this._currentLoggingDiagnosticMonitor.dispatchingAction();
        this._devToolsDiagnostic.dispatchingAction();
    }

    dispatchingEvent(eventType, stage) {
        this._currentLoggingDiagnosticMonitor.startingModelEventLoop(eventType, stage);
        this._devToolsDiagnostic.startingModelEventLoop(eventType, stage);
    }

    dispatchingViaDirective(functionName) {
        this._currentLoggingDiagnosticMonitor.dispatchingViaDirective(functionName);
        this._devToolsDiagnostic.dispatchingViaDirective(functionName);
    }

    dispatchingViaConvention(functionName) {
        this._currentLoggingDiagnosticMonitor.dispatchingViaConvention(functionName);
        this._devToolsDiagnostic.dispatchingViaConvention(functionName);
    }

    finishDispatchingEvent() {
        this._currentLoggingDiagnosticMonitor.finishDispatchingEvent();
        this._devToolsDiagnostic.finishDispatchingEvent();
    }

    postProcessingModel() {
        this._currentLoggingDiagnosticMonitor.postProcessingModel();
        this._devToolsDiagnostic.postProcessingModel();
    }

    endingModelEventLoop() {
        this._currentLoggingDiagnosticMonitor.endingModelEventLoop();
        this._devToolsDiagnostic.endingModelEventLoop();
    }

    dispatchingModelUpdates(modelId) {
        this._currentLoggingDiagnosticMonitor.dispatchingModelUpdates(modelId);
        this._devToolsDiagnostic.dispatchingModelUpdates(modelId);
    }

    dispatchLoopEnd() {
        this._currentLoggingDiagnosticMonitor.dispatchLoopEnd();
        this._devToolsDiagnostic.dispatchLoopEnd();
    }

    halted(modelIds, err) {
        this._currentLoggingDiagnosticMonitor.halted(modelIds, err);
        this._devToolsDiagnostic.halted(modelIds, err);
    }
}