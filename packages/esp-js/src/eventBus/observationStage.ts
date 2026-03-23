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

export enum ObservationStage {
    /**
     * Observe at the preview event stage only
     */
    preview = 'preview',
    /**
     * Observe at the normal event stage only
     */
    normal = 'normal',
    /**
     * Observe an event only if it was committed (by calling eventContext.commit()) during the normal dispatch stage
     */
    committed = 'committed',
    /**
     * Observe after both the normal, and if it ran, the committed state.
     * You can observe here regardless of if the even was committed or not
     */
    final = 'final',
    /**
     * Observe at all event stages
     */
    all = 'all'
}

export namespace ObservationStage {
    export function isPreview(stage: ObservationStage) {
        return stage === ObservationStage.preview;
    }
    export function isNormal(stage: ObservationStage) {
        return stage === ObservationStage.normal;
    }
    export function isCommitted(stage: ObservationStage) {
        return stage === ObservationStage.committed;
    }
    export function isFinal(stage: ObservationStage) {
        return stage === ObservationStage.final;
    }
    export function isAll(stage: ObservationStage) {
        return stage === ObservationStage.all;
    }
    export function isAny(stage: ObservationStage) {
        return isPreview(stage) || isNormal(stage) || isCommitted(stage) || isAll(stage) || isFinal(stage);
    }
    export function isObservationStage(stage: any): stage is ObservationStage {
        return isAny(<ObservationStage>stage);
    }
}