// notice_start
/*
 * Copyright 2015 Keith Woods
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

import esp from '../../src/index';

describe('Router', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.broadcast()', function() {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.broadcastEvent(undefined, 'foo'); }).toThrow();
            expect(() => {_router.broadcastEvent('anEvent', undefined); }).toThrow();
        });

        it('should deliver the event to all models', () => {
            var model1ProcessorReceived = 0, model2ProcessorReceived = 0;
            _router.registerModel('modelId1', {});
            _router.registerModel('modelId2', {});
            _router.getEventObservable('modelId1', 'Event1').observe((event) => {
                model1ProcessorReceived+=event;
            });
            _router.getEventObservable('modelId2', 'Event1').observe((event) => {
                model2ProcessorReceived+=event;
            });
            _router.broadcastEvent('Event1', 10);
            expect(model1ProcessorReceived).toEqual(10);
            expect(model2ProcessorReceived).toEqual(10);
        });
    });
});