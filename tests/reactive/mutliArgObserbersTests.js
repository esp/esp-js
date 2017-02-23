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

describe('multi argument observers', () => {
    let subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('should take a multi argument observe on a subject ', () => {

        let a1, b1;
        subject.subscribe((a, b) => {
            a1 = a;
            b1 = b;
        });
        subject.onNext(1, 2);
        expect(a1).toEqual(1);
        expect(b1).toEqual(2);
    });

    it('should take a multi argument observer with where', () => {
        let a1, b1;
        subject
            .where((a, b) => {
                return a + b === 8;
            })
            .subscribe((a, b) => {
            a1 = a;
            b1 = b;
        });
        subject.onNext(4, 4);
        expect(a1).toEqual(4);
        expect(b1).toEqual(4);
    });
});