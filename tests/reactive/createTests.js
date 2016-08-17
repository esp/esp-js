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

describe('.create', () => {
    var subject;

    beforeEach(() => {
        subject = new reactive.Subject();
    });

    it('.create invokes the subscription factory on observable subscription', () => {
        var subject = new reactive.Subject();
        var stream  = reactive.Observable.create(o => {
            return subject.subscribe(o);
        });
        var received = [];
        stream.subscribe(i => {
            received.push(i);
        });
        subject.onNext(1);
        expect(received.length).toEqual(1);
        expect(received[0]).toEqual(1);
    });
});