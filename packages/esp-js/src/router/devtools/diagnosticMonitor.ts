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

/**
 * hooks onto a global exposed by esp-js-devtools and forwards diagnostics to that
 */
export interface DiagnosticMonitor extends DisposableBase {
    getSummary(): string;
    addModel(modelId: string): void;
    removeModel(modelId: string): void;
    publishEvent(modelId: string, eventType, event): void;
    broadcastEvent(eventType): void;
    executingEvent(eventType): void;
    runAction(modelId: string): void;
    eventEnqueued(modelId, eventType): void;
    dispatchLoopStart(): void;
    startingModelEventLoop(modelId, initiatingEventType): void;
    preProcessingModel(): void;
    dispatchingEvents(): void;
    dispatchingAction(): void;
    dispatchingEvent(eventType, stage): void;
    dispatchingViaDirective(functionName): void;
    finishDispatchingEvent(): void;
    postProcessingModel(): void;
    endingModelEventLoop(): void;
    dispatchingModelUpdates(modelId: string): void;
    dispatchLoopEnd(): void;
    halted(modelIds, err): void;
}