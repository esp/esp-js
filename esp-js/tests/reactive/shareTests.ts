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

import * as reactive from '../../src/reactive/index';
import {Disposable} from '../../src/system/disposables';
import {AutoConnectedObservable} from '../../src/reactive/autoConnectedObservable';
 
describe('.share', () => {
    let subject;
    let subscription1ReceivedItems: Array<number>;
    let subscription2ReceivedItems: Array<number>;
    let subscription1Disposable: Disposable;
    let subscription2Disposable: Disposable;
    let subscription1CompleteCount: number;
    let subscription2CompleteCount: number;
    let connectable: AutoConnectedObservable<number>;

    beforeEach(() => {
        subject = new reactive.Subject();
        connectable = subject.share();
        subscription1ReceivedItems = [];
        subscription2ReceivedItems = [];
        subscription1Disposable = connectable.subscribe(i => subscription1ReceivedItems.push(i), () => subscription1CompleteCount++);
        subscription2Disposable = connectable.subscribe(i => subscription2ReceivedItems.push(i), () => subscription2CompleteCount++);
        subscription1CompleteCount = 0;
        subscription2CompleteCount = 0;
    });

    it('subscribes to underlying only once', () => {
        // subject.onNext({child:5});
        expect(subject.getObserverCount()).toBe(1);
    });

    it('propagates items to observers ', () => {
        subject.onNext(1);

        expect(subscription1ReceivedItems.length).toBe(1);
        expect(subscription1ReceivedItems[0]).toBe(1);

        expect(subscription2ReceivedItems.length).toBe(1);
        expect(subscription2ReceivedItems[0]).toBe(1);
    });

    it('observers can be disposed separately', () => {

        subscription1Disposable.dispose();
        subject.onNext(1);

        expect(subscription1ReceivedItems.length).toBe(0);

        expect(subscription2ReceivedItems.length).toBe(1);
        expect(subscription2ReceivedItems[0]).toBe(1);
    });

    it('observers can be disposed separately', () => {
        subscription1Disposable.dispose();
        subject.onNext(1);

        expect(subscription1ReceivedItems.length).toBe(0);

        expect(subscription2ReceivedItems.length).toBe(1);
        expect(subscription2ReceivedItems[0]).toBe(1);
    });

    it('disconnecting completes the shared streams', () => {
        connectable.disconnect();
        expect(subscription1CompleteCount).toBe(1);
        expect(subscription2CompleteCount).toBe(1);
    });
});