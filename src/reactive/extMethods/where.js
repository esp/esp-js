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

import Observable from '../Observable';
import { Guard } from '../../system';

Observable.prototype.where = function(predicate) {
    Guard.isDefined(predicate, 'predicate Required');
    var source = this;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                if(predicate(arg1, arg2, arg3)) {
                    observer.onNext(arg1, arg2, arg3);
                }
            },
            observer.onError.bind(observer),
            () => observer.onCompleted()
        );
    };
    return new Observable(observe, this._router);
};
