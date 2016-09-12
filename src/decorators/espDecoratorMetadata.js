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
import {Guard} from "../system";

let EspDecoratorMetadata = {
    get isDirtyTracking() {
        // get (from the prototype chain) else false
        return this._isDirtyTracking || false;
    },
    get dirtyTrackingPropName() {
        // get (from the prototype chain) else default
        return this._dirtyTrackingPropName || 'isDirty';
    },
    getAllEvents() {
        // We merge any own event subscriptions with that on the prototype chain.
        // This allows derived types to have differing event subscriptions to the base, yet also respect those declared on the base.
        var parentEvents = this._parent && this._parent._events
            ? this._parent._events
            : [];
        return [...this._events, ...parentEvents];
    },
    addEvent(functionName, eventName, decoratorType, observationStage, predicate, modelId) {
        this._events.push({
            functionName,
            eventName,
            decoratorType,
            observationStage: observationStage || ObservationStage.normal,
            predicate,
            modelId
        });
    },
    addDirtyTracking(isDirtyPropName) {
        this._isDirtyTracking = true;
        if (isDirtyPropName) {
            Guard.isString(isDirtyPropName, 'The isDirtyPropName argument passed to a @dirtyTracking decorator must be a string.');
            Guard.isTrue(isDirtyPropName !== '', 'The isDirtyPropName argument passed to a @dirtyTracking decorator must not be \'\'.');
            this._dirtyTrackingPropName = isDirtyPropName;
        }
    },
    hasMetadata(constructor, onlyCheckForOwnMetadata = false) {
        Guard.isDefined(constructor, 'the object passed to \'hasMetadata()\' must be defined');
        if (onlyCheckForOwnMetadata) {
            return constructor.hasOwnProperty('_espDecoratorMetadata');
        } else {
            // return true if `_espDecoratorMetadata` exists anywhere on the prototype chain
            return constructor._espDecoratorMetadata;
        }
    },
    getOrCreateOwnMetaData(constructor) {
        var hasOwnMetadata = EspDecoratorMetadata.hasMetadata(constructor, true);
        if (hasOwnMetadata) {
            return constructor._espDecoratorMetadata;
        } else {
            return _create(constructor);
        }
    },
    getMetadata(constructor) {
        // if we have metadata anywhere along the prototype chain we're good to go
        if (EspDecoratorMetadata.hasMetadata(constructor)) {
            return constructor._espDecoratorMetadata;
        } else {
            throw new Error(`ESP metadata not found on constructor function`);
        }
    }
};

/**
 * Create ans stores an instance of EspDecoratorMetadata on the given constructor.
 *
 * With both Babel and Typescript the object passed to a decorator declared on a class is something that prototypical derives from the base and has it's constructor property set to the class where the decorator is declared upon.
 * Given this we always store the esp metadata on the constructor property, i.e. on the actually class itself, not it's base.
 * This makes it accessible when using both class based decorators and function (within a class, i.e. on the prototype) based decorators
 *
 * We also store an instance of the metadata on each derived instance of a class.
 * If there is an instance of the metadata on the base class constructor, the derived classes metadata will prototypically inherit from the bases.
 * This allows derived instances to have their own event subscriptions yet inherit those of their base.
 * EspDecoratorMetadata is smart enough to look at both it's own events and that of the parents when a full list of events is required for a particular object graph.
 */
function _create(constructor) {
    var metadata = Object.create(constructor._espDecoratorMetadata || EspDecoratorMetadata);
    metadata._events = [];
    metadata._parent = constructor._espDecoratorMetadata;
    constructor._espDecoratorMetadata = metadata;
    return metadata;
}

export default EspDecoratorMetadata;