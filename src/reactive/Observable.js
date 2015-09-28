// notice_start
/*
 * Copyright 2015 Keith Woods
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

import { Guard } from '../system';
import Observer from './Observer';

class Observable {
    static create(onObserve, router) {
        Guard.lengthIs(arguments, 2, "Incorrect argument count on Observable");
        var observe =  observer => {
            return onObserve(observer);
        };
        return new Observable(observe, router);
    }
    constructor(observe, router) {
        this._observe = observe;
        /*
         * note the Observable has explicit knowledge of the router to enable advanced
         * scenarios whereby links in the observable stream re-post events back into the
         * workflow, it enables the results of async operations and held event actions
         * to be posted back through the full event workflow. It does feel a little dirty
         * but it's reasonable for now. Perhaps the entire reactive objects could be wrapped
         * in a configurable module whereby each instance of the router get's it's own copy,
         * then only the explicit extensions to Observable could access the instance of
         * the router they require.
         */
        this._router = router;
    }
    observe() {
        var observer;
        if(arguments.length === 1 && arguments[0] instanceof Observer) {
            observer = arguments[0];
        } else {
            Guard.lengthIsAtLeast(arguments, 1, "Incorrect args count of " + arguments.length);
            var onNext = arguments[0];
            var onError = arguments.length >= 1 ? arguments[1] : undefined;
            var onCompleted = arguments.length >= 2 ? arguments[2] : undefined;
            observer = new Observer(onNext, onError, onCompleted);
        }
        Guard.isDefined(this._observe, 'observe Required');
        return this._observe(observer);
    }
}

export default Observable;
