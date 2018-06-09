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

import {Guard} from '../system';
import {Observer} from './Observer';
import {Subscribe} from './subscribeDelegate';
import {RouterObservable} from './RouterObservable';
import {Router} from '../router/Router';
import {DisposableWrapper} from '../system/disposables/DisposableWrapper';
import {DictionaryDisposable} from '../system/disposables/DictionaryDisposable';

export interface Observable {
    asObservable?(): Observable;
    do?(action: (arg1, arg2, arg3) => void): Observable;
    map?(action: (arg1, arg2, arg3) => any): Observable;
    take?(count: number): Observable;
    takeUntil?(predicate: (arg1, arg2, arg3) => boolean, inclusive: boolean): Observable;
    where?(filter: (arg1, arg2, arg3) => boolean, inclusive: boolean): Observable;

    asRouterObservable?(router: Router): RouterObservable;
}

export class Observable implements Observable {

    public static create(onObserve) {
        Guard.isDefined(onObserve, 'onObserve not defined');
        let subscribe = observer => {
            let disposable = onObserve(observer);
            // if there was no disposable returned from the onObserve handler we default it to a noop here
            return new DisposableWrapper(disposable || (() => { /*noop*/ }));
        };
        return new Observable(subscribe);
    }

    public static merge(...observables: Observable[]) {
        Guard.lengthIsAtLeast(observables, 1, 'You must provide at least 1 observable to a merge call');
        let subscribe = observer => {
            let observablesLength = observables.length;
            let disposables = new DictionaryDisposable();
            for (let i = 0; i < observables.length; i++) {
                let j = i;
                disposables.add(
                    j.toString(),
                    observables[j].subscribe(
                        (arg1, arg2, arg3) => {
                            observer.onNext(arg1, arg2, arg3);
                        },
                        () => {
                            observablesLength--;
                            disposables.remove(j);
                            if (observablesLength === 0) {
                                observer.onCompleted();
                            }
                        }
                    )
                );
            }
            return disposables;
        };
        return new Observable(subscribe);
    }

    protected _subscribe: Subscribe;

    public constructor(subscribe: Subscribe) {
        this._subscribe = subscribe;
    }

    public subscribe(...args) {
        let observer = Observer.wrap(...args);
        Guard.isDefined(this._subscribe, '_subscribe not set');
        return this._subscribe(observer);
    }
}