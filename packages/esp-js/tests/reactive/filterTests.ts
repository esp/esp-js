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
 
describe('.filter', () => {
    let subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('should pass yielded item to observer', () => {
        let receivedItems = [];
        subject
            .filter(i => {
                receivedItems.push(i);
                return true; })
            .subscribe(i => { });

        subject.onNext(1);
        expect(receivedItems.length).toBe(1);
        expect(receivedItems[0]).toBe(1);
    });

    it('should propagate items based on the predicate result', () => {
        let receivedItems = [];
        subject
            .filter(i => {
                return i > 5; })
            .subscribe(i => { receivedItems.push(i); });

        subject.onNext(1);
        expect(receivedItems.length).toBe(0);
        subject.onNext(6);
        expect(receivedItems.length).toBe(1);
        expect(receivedItems[0]).toBe(6);
    });

    it('doesn\'t propagate to disposed streams', () => {
        let receivedItems = 0;
        let disposable = subject
            .filter(i => {
                return true; })
            .subscribe(i => { receivedItems++; });

        subject.onNext('a');
        subject.onNext('b');
        expect(receivedItems).toBe(2);
        disposable.dispose();
        subject.onNext('c');
        expect(receivedItems).toBe(2);
    });

    it('should bubble errors', () => {
        let disposable = subject
            .filter(i => {
                throw new Error('Boom'); })
            .subscribe(
                i => { });

        expect(() => {
            subject.onNext('a');
        }).toThrow(new Error('Boom'));
    });

    it('should bubble errors in observer', () => {
        let disposable = subject
            .filter(i => {
                return true; })
            .subscribe(
                i => {
                    throw new Error('Boom');
                });

        expect(() => {
            subject.onNext('a');
        }).toThrow(new Error('Boom'));
    });

    it('should propagate onCompleted', () => {
        let onCompleteCalled = false;
        subject
            .filter(i => i > 0)
            .subscribe(
                () => { },
                () => onCompleteCalled = true
            );

        subject.onNext(1);
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });
});