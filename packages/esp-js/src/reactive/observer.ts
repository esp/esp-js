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

export interface Observer<T> {
    onNext(item: T);
    onCompleted();
}

export class Observer<T> implements Observer<T> {
    private _hasCompleted: boolean;
    private _onNext: (item: T) => void;
    private _onCompleted: () => any;
    /**
     * Wraps the provided args in an Observer,
     * Effectively plugs onNext and onCompleted if you don't provide them
     * @returns DefaultObserver
     */
    public static wrap<T>();
    public static wrap<T>(onNext: (item: T) => void);
    public static wrap<T>(onNext: (item: T) => void, onCompleted: () => void);
    public static wrap<T>(...args: any[]) {
        let observer;
        if(args.length === 0) {
            // create a no-op observer
            observer = new Observer(() => {}, () => {});
        } else if(args.length === 1 && args[0] instanceof Observer) {
            observer = args[0];
        } else {
            Guard.lengthIsAtLeast(args, 1, 'Incorrect arg count on observe, should be a single DefaultObserver or (onNext:(t)=>[,onCompleted:()=>{}])');
            let onNext = args[0];
            Guard.isFunction(onNext, 'The first argument to observe must be a function (t=>{})');
            let onCompleted = args.length >= 1 ? args[1] : undefined;
            if(onCompleted) {
                Guard.isFunction(onCompleted, 'The second argument to observe must be a function (()=>{})');
            }
            observer = new Observer(onNext, onCompleted);
        }
        return observer;
    }
    constructor(onNext: (item: T) => void, onCompleted: () => void) {
        Guard.isDefined(onNext, 'onObserve Required');
        this._hasCompleted = false;
        this._onNext = onNext;
        this._onCompleted = () => {
            if(typeof onCompleted !== 'undefined' && typeof onCompleted === 'function') {
                onCompleted();
            }
        };
    }
    onNext(item: T) {
        if(!this._hasCompleted) {
            this._onNext(item);
        }
    }
    onCompleted() {
        if(!this._hasCompleted) {
            this._hasCompleted = true;
            this._onCompleted();
        }
    }
}