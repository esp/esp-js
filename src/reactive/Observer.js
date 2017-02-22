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

import { Guard } from '../system';

export default class Observer {
    /**
     * Wraps the provided arguments in an Observer
     * @returns Observer
     */
    static wrap() {
        let observer;
        if(arguments.length === 0) {
            // create a no-op observer
            observer = new Observer(() => {}, () => {});
        } else if(arguments.length === 1 && arguments[0] instanceof Observer) {
            observer = arguments[0];
        } else {
            Guard.lengthIsAtLeast(arguments, 1, 'Incorrect arg count on observe, should be a single Observer or (onNext:(t)=>[,onCompleted:()=>{}])');
            let onNext = arguments[0];
            Guard.isFunction(onNext, 'The first argument to observe must be a function (t=>{})');
            let onCompleted = arguments.length >= 1 ? arguments[1] : undefined;
            if(onCompleted) {
                Guard.isFunction(onCompleted, 'The second argument to observe must be a function (()=>{})');
            }
            observer = new Observer(onNext, onCompleted);
        }
        return observer;
    }
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