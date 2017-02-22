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

import { utils } from '../system';
import Observable from './Observable';

export default class Subject extends Observable  {
    constructor(cacheLastValue = false) {
        super(undefined);
        this._cacheLastValue = cacheLastValue;
        this._lastValue = undefined;
        this._observers = [];
        this._hasComplete = false;
        // the base object Observable requires _subscribe to be bound to this.
        this._subscribe = subscribe.bind(this);
    }
    // The reactive implementation can push 3 arguments through the stream, initially this was setup to
    // pass all arguments using .apply, however it's performance is about 40% slower than direct method calls
    // given this, and that we only ever push a max of 3 args, it makes sense to hard code them.
    onNext(arg1, arg2, arg3) {
        if(!this._hasComplete) {
            if(this._cacheLastValue) {
                this._lastValue = {arg1: arg1, arg2: arg2, arg3: arg3};
            }
            let os = this._observers.slice(0);
            for (let i = 0, len = os.length; i < len; i++) {
                if(this._hasError) break;
                let observer = os[i];
                observer.onNext(arg1, arg2, arg3);
            }
        }
    }
    onCompleted() {
        if(!this._hasComplete) {
            this._hasComplete = true;
            let os = this._observers.slice(0);
            for (let i = 0, len = os.length; i < len; i++) {
                let observer = os[i];
                observer.onCompleted();
            }
        }
    }
    getObserverCount() {
        return this._observers.length;
    }
}
function subscribe(observer) {
    this._observers.push(observer);
    if(this._cacheLastValue && typeof this._lastValue !== 'undefined') {
        observer.onNext(this._lastValue.arg1, this._lastValue.arg2, this._lastValue.arg3);
    }
    return {
        dispose: () => {
            utils.removeAll(this._observers, observer);
        }
    };
}