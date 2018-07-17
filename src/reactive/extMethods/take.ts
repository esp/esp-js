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

import {Observable} from '../Observable';
import {Guard} from '../../system';
import {Subscribe} from '../subscribeDelegate';

Observable.prototype.take = function<T>(number) {
    Guard.isNumber(number, 'provided value isn\'t a number');
    let source = this;
    let itemsReceived = 0;
    let hasCompleted = false;
    let subscribe: Subscribe<T>  = observer => {
        return source.subscribe(
            (item: T) => {
                // there is possibly some strange edge cases if the observer also pumps a new value, this 'should' cover that (no tests yet)
                itemsReceived++;
                let shouldYield = !number || itemsReceived <= number;
                if (shouldYield) {
                    observer.onNext(item);
                }
                let shouldComplete = !number || itemsReceived >= number;
                if (!hasCompleted && shouldComplete) {
                    hasCompleted = true;
                    observer.onCompleted();
                }
            },
            () => observer.onCompleted()
        );
    };
    return new Observable<T>(subscribe);
};
