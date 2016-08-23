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

import {ObservationStage, Const} from '../router';
import EspDecoratorMetadata from './espDecoratorMetadata';
import Guard from "../system/Guard";

export let DecoratorTypes = {
    observeEvent: 'observeEvent',
    observeModelChangedEvent: 'observeModelChangedEvent'
};

export function observeEvent(eventName, observationStage) {
    return function (target, name, descriptor) {
        if (eventName === Const.modelChangedEvent) {
            throw new Error(`Can not use observeEvent to observe the ${Const.modelChangedEvent} on function target ${name}. Use the observeModelChangedEvent decorator instead`);
        }
        Guard.isString(eventName, 'eventName passed to an observeEvent decorator must be a string');
        Guard.isTrue(eventName !== '', 'eventName passed to an observeEvent decorator must not be \'\'');
        let metadata = EspDecoratorMetadata.getOrCreateOwnMetaData(target);
        metadata.addEvent(
            name,
            eventName,
            DecoratorTypes.observeEvent,
            observationStage
        );
        return descriptor;
    };
};

export function observeModelChangedEvent(modelId) {
    return function (target, name, descriptor) {
        let metadata = EspDecoratorMetadata.getOrCreateOwnMetaData(target);
        metadata.addEvent(
            name,
            Const.modelChangedEvent,
            DecoratorTypes.observeModelChangedEvent,
            ObservationStage.normal,
            modelId
        );
        return descriptor;
    };
};