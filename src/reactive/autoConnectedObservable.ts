// notice_start
/*
 * Copyright 2018 Keith Woods
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

import {Observable} from './observable';
import {Guard} from '../system';
import {Disposable} from '../system/disposables';
import {Subject} from './subject';

export interface AutoConnectedObservable<T> extends Observable<T> {
    disconnect(): void;
}

interface State<T> {
    subject: Subject<T>;
    hasDisconnected: boolean;
    downstreamSubscription?: Disposable;
    disconnect (): void;
}
export class AutoConnectedObservable<T> extends Observable<T> implements AutoConnectedObservable<T> {
    private _state: State<T>;

    constructor(source: Observable<T>, cacheLastValue = false) {
        Guard.isDefined(source, 'source must be defined');
        let state: State<T> = {
            subject: new Subject<T>(cacheLastValue),
            hasDisconnected: false,
            disconnect() {
                this.hasDisconnected = true;
                this.subject.onCompleted();
                this.downstreamSubscription.dispose();
            }
        };
        state.downstreamSubscription = source.subscribe(
            (item: T) => {
                if (!state.hasDisconnected) {
                    state.subject.onNext(item);
                }
            },
            () => {
                state.disconnect();
            }
        );
        super(state.subject.subscribe.bind(state.subject));
        this._state = state;
    }

    public disconnect() {
        this._state.disconnect();
    }
}