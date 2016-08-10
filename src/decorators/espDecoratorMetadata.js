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

export default class EspDecoratorMetadata {
    static getOrCreateOwnMetaData(constructorFunction) {
        if (EspDecoratorMetadata.hasMetadata(constructorFunction, true)) {
            return EspDecoratorMetadata.getMetadata(constructorFunction);
        } else {
            return EspDecoratorMetadata._create(constructorFunction);
        }
    }

    static hasMetadata(constructorFunction, onlyCheckForOwnMetadata = false) {
        if (onlyCheckForOwnMetadata) {
            return constructorFunction && constructorFunction.constructor.hasOwnProperty('_espDecoratorMetadata');
        } else {
            return constructorFunction && constructorFunction.constructor && constructorFunction.constructor._espDecoratorMetadata;
        }
    }

    static getMetadata(constructorFunction) {
        if (!EspDecoratorMetadata.hasMetadata(constructorFunction)) {
            throw new Error(`ESP metadata not found on constructor function`);
        }
        return constructorFunction.constructor._espDecoratorMetadata;
    }

    static _create(constructorFunction) {
        // We always store metadata as an 'own' property on the constructor functions constructor property (i.e. SomeClass.constructor._espDecoratorMetadata).
        // With both Bable and Typescript the object passed to a decorator declared on a class level function is something that prototypical derives from the base and has it's constructor property set to the class where the decorator is declared.
        // Given this we always store the esp metadata on the constructor property, i.e. on the actually class itself, not it's base.
        // This stops the situation whereby all event registrations for all derived types always get stored on the base object.
        // EspDecoratorMetadata is smart enough to look at both it's own events and that of the parents when a full list of events is required for a particular object graph.
        var parentMetadata = constructorFunction.constructor._espDecoratorMetadata;
        var metadata = new EspDecoratorMetadata(parentMetadata);
        constructorFunction.constructor._espDecoratorMetadata = metadata;
        return metadata;
    }

    constructor(parentMetadata) {
        this._events = [];
        this._parentMetadata = parentMetadata;
    }

    getAllEvents() {
        var parentEvents = this._parentMetadata
            ? this._parentMetadata.getAllEvents()
            : [];
        return [...this._events, ...parentEvents];
    }

    addEvent(functionName, eventName, decoratorType, observationStage, modelId) {
        this._events.push({
            functionName,
            eventName,
            decoratorType,
            observationStage: observationStage || ObservationStage.normal,
            modelId
        });
    }
}