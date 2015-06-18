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

import { utils } from '../system';
import Observable from './Observable';

class Subject extends Observable  {
    constructor(router) {
        super(observe.bind(this), router);
        this._observers = [];
        this._hasComplete = false;
        this._hasError = false;
    }
    get hasError() {
        return this._hasError;
    }
    get error() {
        return this._error;
    }
    // The reactivate implementation can push 3 arguments through the stream, initially this was setup to
    // pass all arguments using .apply, however it's performance is about 40% slower than direct method calls
    // given this, and that we only ever push a max of 3 args, it makes sense to hard code them.
    onNext(arg1, arg2, arg3) {
        if(!this._hasComplete) {
            var os = this._observers.slice(0);
            for (var i = 0, len = os.length; i < len; i++) {
                if(this._hasError) break;
                var observer = os[i];
                try {
                    observer.onNext(arg1, arg2, arg3);
                } catch (err) {
                    this._hasError = true;
                    this._error = err;
                    observer.onError(err);
                }
            }
        }
    }
    onCompleted() {
        if(!this._hasComplete && !this._hasError) {
            this._hasComplete = true;
            var os = this._observers.slice(0);
            for (var i = 0, len = os.length; i < len; i++) {
                var observer = os[i];
                observer.onCompleted();
            }
        }
    }
    onError(err) {
        if(!this._hasError) {
            this._hasError = true;
            var os = this._observers.slice(0);
            for (var i = 0, len = os.length; i < len; i++) {
                var observer = os[i];
                observer.onError(err);
            }
        }
    }
    getObserverCount() {
        return this._observers.length;
    }
}
function observe(observer) {
    /*jshint validthis:true */
    this._observers.push(observer);
    return {
        dispose: () => {
            utils.removeAll(this._observers, observer);
        }
    };
}
export default Subject;
