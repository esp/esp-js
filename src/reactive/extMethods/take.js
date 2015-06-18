/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import Observable from '../Observable';
import { Guard } from '../../system';

// TODO beta, needs test
Observable.prototype.take = function(number) {
    Guard.isNumber(number, "provided value isn't a number");
    var source = this;
    var itemsReceived = 0;
    var hasCompleted = false;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                // there is possibly some strange edge cases if the observer also pumps a new value, this 'should' cover that (no tests yet)
                itemsReceived++;
                var shouldYield = !number || itemsReceived <= number;
                if(shouldYield) {
                    observer.onNext(arg1, arg2, arg3);
                }
                var shouldComplete = !number || itemsReceived >= number;
                if(!hasCompleted && shouldComplete) {
                    hasCompleted = true;
                    observer.onCompleted();
                }
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
