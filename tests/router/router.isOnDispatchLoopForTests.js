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

import esp from '../../src';

describe('Router', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.isOnDispatchLoopFor()', function() {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.isOnDispatchLoopFor(); }).toThrow(new Error('modelId must be a string'));
            expect(() => {_router.isOnDispatchLoopFor(1); }).toThrow(new Error('modelId must be a string'));
            expect(() => {_router.isOnDispatchLoopFor({}); }).toThrow(new Error('modelId must be a string'));
            expect(() => {_router.isOnDispatchLoopFor(''); }).toThrow(new Error('modelId must not be empty'));
        });

        it('returns true when on models dispatch loop', () => {
            var model1EventHandler_isOnModel1DispatchLoop = null,
                model1EventHandler_isOnModel2DispatchLoop = null,
                model2EventHandler_isOnModel1DispatchLoop = null,
                model2EventHandler_isOnModel2DispatchLoop = null;
            _router.addModel('modelId1', {});
            _router.addModel('modelId2', {});
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                model1EventHandler_isOnModel1DispatchLoop = _router.isOnDispatchLoopFor('modelId1');
                model1EventHandler_isOnModel2DispatchLoop = _router.isOnDispatchLoopFor('modelId2');
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                model2EventHandler_isOnModel1DispatchLoop = _router.isOnDispatchLoopFor('modelId1');
                model2EventHandler_isOnModel2DispatchLoop = _router.isOnDispatchLoopFor('modelId2');
            });
            expect(_router.isOnDispatchLoopFor('modelId1')).toEqual(false);
            expect(_router.isOnDispatchLoopFor('modelId2')).toEqual(false);
            _router.publishEvent('modelId1', 'Event1', {payload:'theEventPayload'});
            expect(model1EventHandler_isOnModel1DispatchLoop).toEqual(true);
            expect(model1EventHandler_isOnModel2DispatchLoop).toEqual(false);
            _router.publishEvent('modelId2', 'Event1', {payload:'theEventPayload'});
            expect(model2EventHandler_isOnModel1DispatchLoop).toEqual(false);
            expect(model2EventHandler_isOnModel2DispatchLoop).toEqual(true);
        });
    });
});