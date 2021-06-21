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
import {DiagnosticMonitor} from './diagnosticMonitor';
import {GlobalState} from '../../system';

/**
 * hooks onto a global exposed by esp-js-devtools and forwards diagnostics to that
 */
export class DevToolsDiagnosticMonitor extends DisposableBase implements DiagnosticMonitor {
    private _isRegisteredWithDevtools: boolean;
    private _steps: string[];

    constructor() {
        super();
        this._isRegisteredWithDevtools = false;
        this._ensureDiagnosticEnabled();
    }

    getSummary(): string {
        return this._steps.join('\r\n');
    }

    addModel(modelId) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.addModel(modelId);
        }
    }

    removeModel(modelId) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.removeModel(modelId);
        }
    }

    publishEvent(modelId, eventType, event) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.publishEvent(modelId, eventType, event);
        }
    }

    broadcastEvent(eventType) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.broadcastEvent(eventType);
        }
    }

    executingEvent(eventType) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.executingEvent(eventType);
        }
    }

    runAction(modelId) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.runAction(modelId);
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

    finishDispatchingEvent() {
    }

    postProcessingModel() {
    }

    endingModelEventLoop() {
    }

    dispatchingModelUpdates(modelId) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.dispatchingModelUpdates(modelId);
        }
    }

    dispatchLoopEnd() {
    }

    halted(modelIds, err) {
        if (this._ensureDiagnosticEnabled()) {
            GlobalState.__espAnalyticsMonitor.halted(modelIds, err);
        }
    }

    /**
     * Checks for a global hook and if found registers this monitor with that hook
     */
    _ensureDiagnosticEnabled() {
        let checkIsEnabled = () => typeof window !== 'undefined' && (typeof GlobalState.__espAnalyticsMonitor !== 'undefined' && GlobalState.__espAnalyticsMonitor !== null);
        let isDiagnosticEnabled = checkIsEnabled();
        if (isDiagnosticEnabled && !this._isRegisteredWithDevtools) {
            this._isRegisteredWithDevtools = true;
            GlobalState.__espAnalyticsMonitor.registerMonitor(this);
            this.addDisposable(() => {
                if (checkIsEnabled()) {
                    GlobalState.__espAnalyticsMonitor.unregisterMonitor(this);
                }
            });
        }
        return isDiagnosticEnabled;
    }
}