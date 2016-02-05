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

import { DisposableBase } from '../../model';

/**
 * hooks onto a global exposed by esp-js-devtools and forwards diagnostics to that
 */
export default class DevToolsDiagnosticMonitor extends DisposableBase {
    constructor() {
        super();
        this._diagnosticEnabled = this._evualateDiagnosticEnabled();
        this._tryRegisterWithDevtools();
    }
    getSummary() {
        return this._steps.join('\r\n');
    }
    addModel(modelId){
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.addModel(modelId);
        }
    }
    publishEvent(modelId, eventType) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.publishEvent(modelId, eventType);
        }
    }
    broadcastEvent(eventType) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.broadcastEvent(eventType);
        }
    }
    executingEvent(eventType) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.executingEvent(eventType);
        }
    }
    runAction(modelId) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.runAction(modelId);
        }
    }
    eventEnqueued(modelId, eventType) {
    }
    eventIgnored(modelId, eventType) {
    }
    dispatchLoopStart() {
    }
    startingModelEventLoop(modelId, initiatingEventType) {
    }
    preProcessingModel() {
    }
    dispatchingEvents() {
    }
    dispatchingAction() {
    }
    dispatchingEvent(eventType, stage) {
    }
    dispatchingViaDirective(functionName) {
    }
    dispatchingViaConvention(functionName) {
    }
    finishDispatchingEvent() {
    }
    postProcessingModel() {
    }
    endingModelEventLoop() {
    }
    dispatchingModelUpdates(modelId) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.dispatchingModelUpdates(modelId);
        }
    }
    dispatchLoopEnd() {
    }
    halted(modelIds, err) {
        if(this._diagnosticEnabled) {
            window.__espAnalyticsMonitor.halted(modelIds, err);
        }
    }
    _evualateDiagnosticEnabled() {
        return this._diagnosticEnabled = typeof window !== 'undefined' && typeof window.__espAnalyticsMonitor !== 'undefined';
    }
    _tryRegisterWithDevtools() {
        if( this._evualateDiagnosticEnabled()) {
            window.__espAnalyticsMonitor.registerMonitor(this);
            this.addDisposable(() => {
                if(this._evualateDiagnosticEnabled()) {
                    window.__espAnalyticsMonitor.unregisterMonitor(this);
                }
            });
        }
    }
}