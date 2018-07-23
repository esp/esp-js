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
import {Observer} from './observer';
import {Subscribe} from './subscribeDelegate';
import {RouterObservable} from './routerObservable';
import {Router} from '../router';
import {DisposableWrapper} from '../system/disposables';
import {DictionaryDisposable} from '../system/disposables';
import {DisposableOrFunction} from '../system/disposables/disposable';
import {AutoConnectedObservable} from './autoConnectedObservable';

export interface Observable<T> {
    asObservable?(): Observable<T>;
    do?(action: (item: T) => void): Observable<T>;
    map?(action: (item: T) => any): Observable<T>;
    cast?<TDownstream>(): Observable<TDownstream>;
    take?(count: number): Observable<T>;
    takeUntil?(predicate: (item: T) => boolean, inclusive: boolean): Observable<T>;
    where?(filter: (item: T) => boolean): Observable<T>;
    share?(cacheLastValue?: boolean): AutoConnectedObservable<T>;

    asRouterObservable?(router: Router): RouterObservable<T>;
}

export interface OnObserve<T>  {
    (observer: Observer<T>): DisposableOrFunction;
}

export class Observable<T> implements Observable<T> {

    public static create<T>(onObserve: OnObserve<T>) {
        Guard.isDefined(onObserve, 'onObserve not defined');
        let subscribe: Subscribe<T> = observer => {
            let disposable = onObserve(observer);
            // if there was no disposable returned from the onObserve handler we default it to a noop here
            return new DisposableWrapper(disposable || (() => { /*noop*/ }));
        };
        return new Observable<T>(subscribe);
    }

    public static merge<T>(...observables: Observable<T>[]) {
        Guard.lengthIsAtLeast(observables, 1, 'You must provide at least 1 observable to a merge call');
        let subscribe = observer => {
            let observablesLength = observables.length;
            let disposables = new DictionaryDisposable();
            for (let i = 0; i < observables.length; i++) {
                let j = i;
                disposables.add(
                    j.toString(),
                    observables[j].subscribe(
                        (item: T) => {
                            observer.onNext(item);
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
        return new Observable<T>(subscribe);
    }

    protected _subscribe: Subscribe<T>;

    public constructor(subscribe: Subscribe<T>) {
        this._subscribe = subscribe;
    }

    public subscribe(observer: Observer<T>);
    public subscribe(onNext: () => void);
    public subscribe(onNext: (item: T) => void);
    public subscribe(onNext: () => void, onCompleted: () => void);
    public subscribe(onNext: (item: T) => void, onCompleted: () => void);
    public subscribe(...args: any[]) {
        let observer = (<any>Observer).wrap(...args);
        Guard.isDefined(this._subscribe, '_subscribe not set');
        return this._subscribe(observer);
    }
}