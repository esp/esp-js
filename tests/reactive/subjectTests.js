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

// there are more edge cases here that could be coded against, i.e. kill the subject if it errors,
// ensuring edge cases with multiple observers don't interfere with others, ordering of publication
// just to name a few
describe('subject', () => {
    let subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('onNext pushes item to observers', () => {
        let receivedItems1 = [];
        let receivedItems2 = [];
        subject.subscribe(i => {
            receivedItems1.push(i);
        });
        subject.subscribe(i => {
            receivedItems2.push(i);
        });

        subject.onNext(1);
        subject.onNext(2);

        expect(receivedItems1.length).toBe(2);
        expect(receivedItems1[0]).toBe(1);
        expect(receivedItems1[1]).toBe(2);

        expect(receivedItems2.length).toBe(2);
        expect(receivedItems2[0]).toBe(1);
        expect(receivedItems2[1]).toBe(2);
    });

    it('calls onError bubbles exception', () => {
        subject.subscribe(i => {
            throw new Error('Boom');
        });
        expect(() => {
            subject.onNext(1);
        }).toThrow(new Error('Boom'));
    });


    it('removes observers on dispose', () => {
        let publishCount = 0;
        let disposable = subject.subscribe(i => {
            publishCount++;
        });
        subject.onNext(1);
        expect(publishCount).toBe(1);
        disposable.dispose();
        subject.onNext(2);
        expect(publishCount).toBe(1);
    });

    it('should call onCompleted on observers when it completes', () => {
        let didComplete1 = false, didComplete2 = false;
        subject.subscribe(
            () => { },
            () => didComplete1 = true
        );
        subject.subscribe(
            () => { },
            () => didComplete2 = true
        );
        subject.onCompleted();
        expect(didComplete1).toEqual(true);
        expect(didComplete2).toEqual(true);
    });

    it('should not onNext after completes', () => {
        let onNextCount = 0;
        subject.subscribe(
            () => {
                onNextCount++;
            },
            () => { }
        );
        subject.onNext(1);
        subject.onCompleted();
        subject.onNext(1);
        expect(onNextCount).toEqual(1);
    });

    it('.subscribe propagates onCompleted', () => {
        let onCompleteCalled = false;
        subject.subscribe(
            () => { },
            () => onCompleteCalled = true
        );
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });

    it('can subscribe using observer function', () => {
        let onNextCalled = false;
        subject.subscribe(
            () => {
                onNextCalled = true;
            }
        );
        subject.onNext(1);
        expect(onNextCalled).toEqual(true);
    });

    it('can subscribe using observer', () => {
        let onCompleteCalled = false;
        let receivedItems = [];
        let observer = new reactive.Observer(
            item => {
                receivedItems.push(item);
            },
            () => onCompleteCalled = true
        );
        subject.where(_=>true).subscribe(observer);
        subject.onNext(1);
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
        expect(receivedItems).toEqual([1]);
    });
});