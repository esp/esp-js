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

class Observer {
    constructor(onNext, onCompleted) {
        Guard.isDefined(onNext, 'onObserve Required');
        this._hasCompleted = false;
        this._onNext = onNext;
        this._onCompleted = () => {
            if(typeof onCompleted !== 'undefined' && typeof onCompleted === 'function') {
                onCompleted();
            }
        };
    }
    onNext(arg1, arg2, arg3) {
        if(!this._hasCompleted) {
            this._onNext(arg1, arg2, arg3);
        }
    }
    onCompleted() {
        if(!this._hasCompleted) {
            this._hasCompleted = true;
            this._onCompleted();
        }
    }
}
export default Observer;
