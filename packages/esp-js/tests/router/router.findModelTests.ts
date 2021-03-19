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

import * as esp from '../../src';

describe('Router', () => {

    let _router,
        m1,
        m2,
        m3;

    beforeEach(() => {
        _router = new esp.Router();
        m1 = { id: 'm1'};
        m2 = { id: 'm2'};
        m3 = { id: 'm3'};
        _router.addModel('m1', m1);
        _router.addModel('m2', m2);
        _router.addModel('m3', m3);

    });

    describe('.findModel()', () => {
        it('finds model', () => {
            const foundM1 =_router.findModel(m => m.id === 'm1');
            expect(foundM1).toBe(m1);
            const foundM2 =_router.findModel(m => m.id === 'm2');
            expect(foundM2).toBe(m2);
            const foundM3 =_router.findModel(m => m.id === 'm3');
            expect(foundM3).toBe(m3);
        });

        it('returns null if model not found', () => {
            const shouldBeNull =_router.findModel(m => m.id === 'not-there');
            expect(shouldBeNull).toBeNull();
        });

        it('should throw if predicate not a function', () => {
            expect(() => {_router.findModel(<any>'boom'); }).toThrow(new Error('predicate should be a function'));
            expect(() => {_router.findModel(undefined); }).toThrow(new Error('predicate should be a function'));
        });
    });
});