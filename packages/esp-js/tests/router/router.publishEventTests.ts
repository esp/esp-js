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

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.publishEvent()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.publishEvent(undefined, 'Foo', 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', undefined, 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', 'Foo', undefined); }).toThrow();
            expect(() => {_router.publishEvent({ },'foo', 'foo'); }).toThrow('The modelId argument should be a string');
        });

        it('queues and processes events received during event loop by model id', () => {
            let model1ProcessorReceived = 0, testPassed = false;
            _router.addModel('modelId1', {});
            _router.addModel('modelId2', {});
            _router.getEventObservable('modelId1', 'startEvent').subscribe(() => {
                // publish an event for modelId2 while processing modelId1, thus queuing them
                _router.publishEvent('modelId2', 'Event1', 'theEvent'); // should be processed second
                _router.publishEvent('modelId1', 'Event1', 'theEvent'); // should be processed first
            });
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                model1ProcessorReceived++;
            });
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => {
                testPassed = model1ProcessorReceived === 1;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
        });

        it('should reset the EventContext for each event', () => {
            let testPassed = false;
            let lastEventDelivered = false;
            _router.addModel('modelId1', {});
            _router.getEventObservable('modelId1', 'startEvent').subscribe(({event, context}) => {
                context.commit();
                _router.publishEvent('modelId1', 'Event1', 'theEvent1');
                _router.publishEvent('modelId1', 'Event2', 'theEvent2');
                _router.publishEvent('modelId1', 'Event3', 'theEvent3');
            });
            _router.getEventObservable('modelId1', 'Event1').subscribe(({event, context}) => {
                testPassed = context.isCommitted === false;
                context.commit();
            });
            _router.getEventObservable('modelId1', 'Event2').subscribe(({event, context}) => {
                testPassed = testPassed && context.isCommitted === false;
                context.commit();
            });
            _router.getEventObservable('modelId1', 'Event3').subscribe(({event, context}) => {
                testPassed = testPassed && context.isCommitted === false;
                lastEventDelivered = true;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
            expect(lastEventDelivered).toBe(true);
        });

        it('should copy custom properties on eventContext.custom', () => {
            pending();
        });
    });
});