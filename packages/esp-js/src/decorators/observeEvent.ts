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

import {ObservationStage} from '../router';
import {EspDecoratorUtil, DecoratorTypes, EventPredicate} from './espDecoratorMetadata';
import {Guard, utils} from '../system';

const _observeEvent = (observeEnvelope: boolean, ...args: any[]) => {
    return function (target, name, descriptor) {
        let eventType1: string, observationStage1: ObservationStage, predicate1: EventPredicate;
        if(args.length >= 0) {
            eventType1 = args[0];
        }
        if(args.length >= 1) {
            if(utils.isString(args[1])) {
                observationStage1 = args[1];
            } else if (utils.isFunction(args[1])) {
                predicate1 = args[1];
            }
        }
        if(!predicate1 && args.length >= 2) {
            predicate1 = args[2];
        }
        Guard.isString(eventType1, 'eventType passed to an observeEvent decorator must be a string');
        Guard.isTruthy(eventType1 !== '', 'eventType passed to an observeEvent decorator must not be \'\'');
        if(observationStage1) {
            Guard.isString(observationStage1, 'observationStage passed to an observeEvent decorator must be a string');
            Guard.isTruthy(<string>observationStage1 !== '', 'observationStage passed to an observeEvent decorator must not be \'\'');
        }
        if(predicate1) {
            Guard.isFunction(predicate1, 'predicate passed to an observeEvent decorator must be a function');
        }
        let metadata = EspDecoratorUtil.getOrCreateMetaData(target.constructor);
        metadata.addEvent(
            name,
            eventType1,
            observeEnvelope ? DecoratorTypes.observeEventEnvelope : DecoratorTypes.observeEvent,
            observationStage1,
            predicate1
        );
        return descriptor;
    };
};

export function observeEvent(eventType: string);
export function observeEvent(eventType: string, observationStage: ObservationStage);
export function observeEvent(eventType: string, predicate: EventPredicate);
export function observeEvent(eventType: string, observationStage: ObservationStage, predicate: EventPredicate);
export function observeEvent(...args: any[]) {
    return _observeEvent(false, ...args);
}

export function observeEventEnvelope(eventType: string);
export function observeEventEnvelope(eventType: string, observationStage: ObservationStage);
export function observeEventEnvelope(eventType: string, predicate: EventPredicate);
export function observeEventEnvelope(eventType: string, observationStage: ObservationStage, predicate: EventPredicate);
export function observeEventEnvelope(...args: any[]) {
    return _observeEvent(true, ...args);
}