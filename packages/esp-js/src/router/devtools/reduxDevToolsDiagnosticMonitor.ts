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
import {ModelAddress} from '../modelAddress';
import {connectReduxDevTools, sendUpdateToReduxDevTools} from './reduxDevToolsConnector';

interface RegisteredModel {
    modelId: string;
    eventCount: number;
    modelUpdateCount: number;
    lastEventTimestamp: Date;
}

interface DevToolsState {
    routerName: string;
    registeredModelsMap: { [modelId: string]: RegisteredModel };
    top20NoisyModelsEventCount: { [modelId: string]: number };
}

export class ReduxDevToolsDiagnosticMonitor extends DisposableBase implements DiagnosticMonitor {
    private _state: DevToolsState;
    private _noisyModelMap: Map<string, number> = new Map();

    constructor(private _routerName: string) {
        super();
        this._state = {
            routerName: this._routerName,
            registeredModelsMap: {},
            top20NoisyModelsEventCount: {}
        };
        const disconnectDevTools = connectReduxDevTools(this._routerName);
        this.addDisposable(() => disconnectDevTools());
        this._sendDevToolsUpdate('@@INIT', null);
    }

    addModel(modelId: string): void {
        const registeredModelState = {
            modelId: modelId,
            eventCount: 0,
            lastEventTimestamp: new Date(),
            modelUpdateCount: 0
        };
        const registeredModelsMap = {
            ...this._state.registeredModelsMap,
            [modelId]: registeredModelState
        };
        this._state = {
            ...this._state,
            registeredModelsMap
        };
        this._noisyModelMap.set(modelId, 0);
        this._sendDevToolsUpdate('router:add_model', {modelId: modelId});
    }

    removeModel(modelId: string): void {
        this._noisyModelMap.delete(modelId);
        delete this._state.registeredModelsMap[modelId];
        const registeredModelsMap = {
            ...this._state.registeredModelsMap
        };
        this._state = {
            ...this._state,
            registeredModelsMap
        };
        this._sendDevToolsUpdate('router:remove_model', {modelId: modelId});
    }

    publishEvent(modelIdOrModelAddress: string | ModelAddress, eventType: string, event: string): void {

    }

    broadcastEvent(eventType: string): void {

    }

    executingEvent(eventType: string): void {

    }

    runAction(modelId: string): void {

    }

    eventEnqueued(modelId: string, entityKey: string, eventType: string, event: any): void {
        let eventCount = this._noisyModelMap.get(modelId);
        this._noisyModelMap.set(modelId, eventCount + 1);
        this._updateRegisteredModelAndSendDevToolsUpdate(
            `router_eventEnqueued:${eventType}${entityKey ? ':' + entityKey : ''}`,
            event,
            modelId,
            rm => {
                return {
                    ...rm,
                    eventCount: rm.eventCount + 1,
                    lastEventTimestamp: new Date(),
                };
            }
        );
    }

    dispatchLoopStart(): void {

    }

    startingModelEventLoop(modelId: string, entityKey: string, initiatingEventType: string): void {

    }

    preProcessingModel(): void {

    }

    dispatchingEvents(): void {

    }

    dispatchingAction(): void {

    }

    dispatchingEvent(eventType: string, stage: string): void {

    }

    dispatchingViaDirective(functionName: string): void {

    }

    finishDispatchingEvent(): void {

    }

    postProcessingModel(): void {

    }

    endingModelEventLoop(): void {

    }

    dispatchingModelUpdates(modelId: string, model: any): void {
        this._updateRegisteredModelAndSendDevToolsUpdate(
            'router:model_updated',
            null,
            modelId,
            rm => {
                return {
                    ...rm,
                    modelUpdateCount: rm.eventCount + 1,
                };
            }
        );
    }

    dispatchLoopEnd(): void {

    }

    halted(modelIds: string[], err: string): void {

    }

    private _updateRegisteredModelAndSendDevToolsUpdate = (eventType: string, event: any, modelId: string, modelModifier: (rm: RegisteredModel) => RegisteredModel): void => {
        const registeredModelUpdate = modelModifier(this._state.registeredModelsMap[modelId]);
        const registeredModelsMap = {
            ...this._state.registeredModelsMap,
            [modelId]: registeredModelUpdate
        };
        const top20NoisyModelsEventCount = this._findTop20NoisyModels();
        this._state = {
            ...this._state,
            registeredModelsMap,
            top20NoisyModelsEventCount
        };
        this._sendDevToolsUpdate(eventType, event);
    };

    private _sendDevToolsUpdate = (eventType: string, event: any) => {
        sendUpdateToReduxDevTools(
            {eventType: eventType, event: event},
            this._state,
            this._routerName
        );
    };

    private _findTop20NoisyModels() {
        const entriesArray = Array.from(this._noisyModelMap.entries());
        return entriesArray
            .sort((a, b) => b[1] - a[1])
            .slice(0, 20)
            .reduce(
                (state, currentValue) => {
                    let modelId = currentValue[0];
                    state[modelId] = currentValue[1];
                    return state;
                },
                {}
            );
    }
}