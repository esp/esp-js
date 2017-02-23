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
 
describe('.map', () => {
    let subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('yields the selected item', () => {
        let receivedItems = [];
        subject
            .map(i => i.child)
            .subscribe(child => receivedItems.push(child));

        subject.onNext({child:5});
        expect(receivedItems.length).toBe(1);
        expect(receivedItems[0]).toBe(5);
    });

    it('should bubble errors', () => {
        let disposable = subject
            .map(i => {
                throw new Error('Boom'); })
            .subscribe(
                i => { });

        expect(() => {
            subject.onNext('a');
        }).toThrow(new Error('Boom'));
    });

    it('should bubble errors in observer', () => {
        let select = subject
            .map(i => i)
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
            .map(i => i)
            .subscribe(
                () => { },
                () => onCompleteCalled = true
            );

        subject.onNext(1);
        subject.onCompleted();
        expect(onCompleteCalled).toEqual(true);
    });
});