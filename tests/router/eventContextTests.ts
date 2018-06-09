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

import { EventContext } from '../../src';

describe('EventContext', () => {
    let ec;

    beforeEach(function(){
        ec = new EventContext('modekId', 'eventType', "event1Data");
    });

    it('throws if canceled twice', () => {
        ec.cancel();
        expect(function() { ec.cancel(); }).toThrow();
    });

    it('throws if committed twice', () => {
        ec.commit();
        expect(function() { ec.commit(); }).toThrow();
    });

    it('should set isCommitted on commit', function() {
        ec.commit();
        expect(ec.isCommitted).toEqual(true);
    });

    it('should set isCancelled on commit', function() {
        ec.cancel();
        expect(ec.isCanceled).toEqual(true);
    });
});