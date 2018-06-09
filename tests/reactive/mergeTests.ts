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
import {SingleModelRouter} from '../../src/router/SingleModelRouter';

describe('.merge', () => {
    let subject1,
        subject2,
        subject3,
        receivedItems,
        mergedStream,
        subscription,
        mergedStreamCompleteCount;

    beforeEach(() => {
        receivedItems = [];
        subject1 = new reactive.Subject();
        subject2 = new reactive.Subject();
        subject3 = new reactive.Subject();
        mergedStreamCompleteCount = 0;
        mergedStream = reactive.Observable.merge(
            subject1,
            subject2,
            subject3
        );
        subscription = mergedStream.subscribe(
            i => receivedItems.push(i),
            () => mergedStreamCompleteCount++
        );
    });

    it('merges items from observables into a single observable stream', () => {
        subject1.onNext(1);
        subject2.onNext(2);
        subject3.onNext(3);
        subject1.onNext(1);
        subject2.onNext(2);
        subject3.onNext(3);
        expect(receivedItems).toEqual([1, 2, 3, 1, 2, 3]);
    });

    it('disposes underlying subscriptions when merged stream is disposed', () => {
        subject1.onNext(1);
        subject2.onNext(2);
        subject3.onNext(3);
        subscription.dispose();
        subject1.onNext(4);
        subject2.onNext(5);
        subject3.onNext(6);
        expect(receivedItems).toEqual([1, 2, 3]);
    });

    it('completes merged stream with all underlying observables are completed', () => {
        subject1.onNext(1);
        subject2.onNext(2);
        subject3.onNext(3);
        expect(receivedItems).toEqual([1, 2, 3]);

        subject1.onCompleted();
        subject1.onNext(4);
        expect(receivedItems).toEqual([1, 2, 3]);
        expect(mergedStreamCompleteCount).toEqual(0);

        subject2.onCompleted();
        subject2.onNext(5);
        expect(receivedItems).toEqual([1, 2, 3]);
        expect(mergedStreamCompleteCount).toEqual(0);

        subject3.onCompleted();
        subject3.onNext(6);
        expect(receivedItems).toEqual([1, 2, 3]);
        expect(mergedStreamCompleteCount).toEqual(1);

        subject1.onCompleted();
        expect(mergedStreamCompleteCount).toEqual(1);
    });

    it('test with router', () => {
        let receivedEvents = [];
        let router = SingleModelRouter.createWithModel({});
        let mergedEventStream = reactive.Observable.merge(
            router.getEventObservable('myEvent1'),
            router.getEventObservable('myEvent2'),
            router.getEventObservable('myEvent3'),
        );
        mergedEventStream.subscribe(e => receivedEvents.push(e));

        router.publishEvent('myEvent1', 1);
        expect(receivedEvents).toEqual([1]);

        router.publishEvent('myEvent2', 2);
        expect(receivedEvents).toEqual([1, 2]);

        router.publishEvent('myEvent3', 3);
        expect(receivedEvents).toEqual([1, 2, 3]);
    });
});