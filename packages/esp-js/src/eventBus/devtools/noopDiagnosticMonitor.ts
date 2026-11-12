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

import {DiagnosticMonitor} from './diagnosticMonitor';
import {DisposableBase} from '../../system/disposables';
import { StoreAddress } from '../storeAddress';

export class NoopDiagnosticMonitor extends DisposableBase implements DiagnosticMonitor {
    addStore(storeId: string): void {

    }
    removeStore(storeId: string): void {

    }
    publishEvent(storeIdOrStoreAddress: string | StoreAddress, eventType: string, event: string): void {

    }
    broadcastEvent(eventType: string): void {

    }
    executingEvent(eventType: string): void {

    }
    eventEnqueued(storeId: string, entityKey: string, eventType: string): void {

    }
    dispatchLoopStart(): void {

    }
    startingModelEventLoop(storeId: string, entityKey: string, initiatingEventType: string): void {

    }
    preProcessingModel(): void {

    }
    dispatchingEvents(): void {

    }
    dispatchingEvent(eventType: string, stage: string): void {

    }
    finishDispatchingEvent(): void {

    }
    postProcessingModel(): void {

    }
    endingModelEventLoop(): void {

    }
    dispatchingModelUpdates(storeId: string, model: any): void {

    }
    dispatchLoopEnd(): void {

    }
    halted(storeIds: string[], err: string): void {

    }
}
