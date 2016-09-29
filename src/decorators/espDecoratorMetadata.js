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
    getAllEvents(object) {
        let ownEvents = object.constructor._espDecoratorMetadata._events;
        let parentEvents;
        // see comments in _createMetadata as to why we need to do this.
        let basePrototype = Object.getPrototypeOf(Object.getPrototypeOf(object));
        if(basePrototype.constructor._espDecoratorMetadata) {
            parentEvents = this.getAllEvents(basePrototype);
        } else {
            parentEvents = [];
        }
        return [...ownEvents, ...parentEvents];
    },
    hasMetadata(constructor) {
        let metadata = this.getMetadata(constructor);
        return !!metadata;
    },
    getMetadata(constructor) {
        Guard.isDefined(constructor, 'the object passed to \'hasMetadata()\' must be defined');
        if(constructor._espDecoratorMetadata) {
            return constructor._espDecoratorMetadata;
        }
        return null;
    },
    getOrCreateMetaData(constructor) {
        if (constructor.hasOwnProperty('_espDecoratorMetadata')) {
            return constructor._espDecoratorMetadata;
        } else {
            return _createMetadata(constructor);
        }
    }
};

let Metadata = {
    init() {
        this._events = [];
        return this;
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
    }
};

/**
 * Create and stores an instance of EspDecoratorMetadata on the given constructor as an own property.
 *
 * With both Babel and Typescript the object passed to a decorator declared on a class is something that prototypical derives from the base (if any) and has it's constructor property set to the ctor-function/class where the decorator is declared upon.
 * Given this we always store the esp metadata on the constructor property, i.e. on the actually ctor-function/class itself, not it's base.
 *
 * The initial intention with this code was to store the metadata on the constructor, and inspect the constructors prototype to see if it has any metadata of it's own, then our metadata could prototypically derive from that (i.e with Object.create()).
 * This would allow for a full lists of events for an object graph to be obtained.
 * Unfortunately Babel and TypeScript have different implementation of the constructor property and make this somewhat problematic.
 * In Babel the constructor property is a ctor function that prototypically inherits from the base object, in TypeScript it's inherits from function directly, you have no access to that constructors prototype making prototypical inheritance impossible at this point.
 * Babel and TypeScript have different implementation of object 'extends' too (TS copies 'own' properties from the base, Babel doesn't.
 *
 * The best we can do here is always store metadata as an own property then traverse the prototype manually when getting all events for an object graph in question.
 * This approach still allows derived instances to have their own event subscriptions yet inherit those of their base, abit somewhat manually.
 * It will also work with both TypeScript and Babel.
 * EspDecoratorMetadata.getAllEvents(object) is smart enough to look at the given 'object' metadata and manually lookup any base objects metadata as declared on the base objects constructors.
 *
 * Issue #136 has more note on this.
 */
function _createMetadata(constructor) {
    let metadata = Object.create(Metadata).init();
    Object.defineProperty(constructor, '_espDecoratorMetadata', {
        value: metadata,
        // by default enumerable is false, I'm just being explicit here.
        // When Typescript derives from a base class it copies all own property to the new instance we don't want the metadata copied. 
        enumerable: false
    });
    return metadata;
}

export default EspDecoratorMetadata;