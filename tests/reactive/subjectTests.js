/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import * as reactive from '../../src/reactive/index';

// there are more edge cases here that could be coded against, i.e. kill the subject if it errors,
// ensuring edge cases with multiple observers don't interfere with others, ordering of publication
// just to name a few
describe('subject', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('onNext pushes item to observers', () => {
        var receivedItems1 = [];
        var receivedItems2 = [];
        subject.observe(i => {
            receivedItems1.push(i);
        });
        subject.observe(i => {
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

    it('calls onError then observer throws', () => {
        var error;
        subject.observe(i => {
            throw 'Boom';
        }, ex => {
            error = ex;
        });
        subject.onNext(1);
        expect(error).toBe('Boom');
    });


    it('removes observers on dispose', () => {
        var publishCount = 0;
        var disposable = subject.observe(i => {
            publishCount++;
        });
        subject.onNext(1);
        expect(publishCount).toBe(1);
        disposable.dispose();
        subject.onNext(2);
        expect(publishCount).toBe(1);
    });

    it('should call onCompleted on observers when it completes', () => {
        var didComplete1 = false, didComplete2 = false;
        subject.observe(
            () => { },
            () => {},
            () => didComplete1 = true
        );
        subject.observe(
            () => { },
            () => {},
            () => didComplete2 = true
        );
        subject.onCompleted();
        expect(didComplete1).toEqual(true);
        expect(didComplete2).toEqual(true);
    });

    it('should not onNext after completes', () => {
        var onNextCount = 0;
        subject.observe(
            () => {
                onNextCount++;
            },
            () => {},
            () => { }
        );
        subject.onNext(1);
        subject.onCompleted();
        subject.onNext(1);
        expect(onNextCount).toEqual(1);
    });

    it('.observe propagate errors', () => {
        var error;
        var disposable = subject
            .where(i => {
                return true; })
            .observe(
                i => { throw 'Boom'; },
                ex =>{ error = ex;});

        subject.onNext('a');
        expect(error).toBe('Boom');
    });

    it('.observe propagates onCompleted', () => {
        var onCompleteCalled = false;
        subject.observe(
            () => { },
            () =>{ },
            () => onCompleteCalled = true
        );
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });
});