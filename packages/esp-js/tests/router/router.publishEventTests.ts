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

import {Router, EventEnvelope, DefaultModelAddress} from '../../src';

describe('Router', () => {

    let _router: Router;

    beforeEach(() => {
        _router = new Router();
    });

    describe('.publishEvent()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.publishEvent(undefined, 'Foo', 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', undefined, 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', 'Foo', undefined); }).toThrow();
            expect(() => {_router.publishEvent({ },'foo', 'foo'); }).toThrow('Invalid ModelAddress provided, expected modelId property to be defined, received undefined');
            expect(() => {_router.publishEvent({ entityKey: 'theKey' },'foo', 'foo'); }).toThrow('Invalid ModelAddress provided, expected modelId property to be defined, received undefined');
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

        it('should throw if you publish without registering the model', () => {
            expect(() => {
                _router.publishEvent('fooModel', 'startEvent', 'start');
            }).toThrow();

            let receivedEvents = [];
            // cause a lazy model registration
            _router.getEventObservable('fooModel', 'startEvent').subscribe(ee => receivedEvents.push(ee));

            expect(() => {
                _router.publishEvent('fooModel', 'startEvent', 'start');
            }).toThrow();

            _router.addModel('fooModel', {});
            _router.publishEvent('fooModel', 'startEvent', 'start');

            expect(receivedEvents.length).toEqual(1);
        });

        it('can publish with ModelAddress and DefaultModelAddress', () => {
            let receivedEnvelopes: EventEnvelope<unknown, unknown>[] = [];
            _router.addModel('modelId1', {});
            _router.getEventObservable('modelId1', 'startEvent').subscribe((e: EventEnvelope<unknown, unknown>) => {
                receivedEnvelopes.push(e);
            });
            _router.publishEvent({ modelId: 'modelId1' }, 'startEvent', 'theEvent');
            expect(receivedEnvelopes.length).toBe(1);
            expect(receivedEnvelopes[0].entityKey).not.toBeDefined();
            _router.publishEvent(new DefaultModelAddress('modelId1'), 'startEvent', 'theEvent');
            expect(receivedEnvelopes.length).toBe(2);
            expect(receivedEnvelopes[1].entityKey).not.toBeDefined();
        });

        it('can publish including entityKey', () => {
            let receivedEnvelopes: EventEnvelope<unknown, unknown>[] = [];
            _router.addModel('modelId1', {});
            _router.getEventObservable('modelId1', 'startEvent').subscribe((e: EventEnvelope<unknown, unknown>) => {
                receivedEnvelopes.push(e);
            });
            _router.publishEvent({ modelId: 'modelId1', entityKey: 'the-key-1' }, 'startEvent', 'theEvent');
            expect(receivedEnvelopes.length).toBe(1);
            expect(receivedEnvelopes[0].entityKey).toBe('the-key-1');
            _router.publishEvent(new DefaultModelAddress('modelId1', 'the-key-2'), 'startEvent', 'theEvent');
            expect(receivedEnvelopes.length).toBe(2);
            expect(receivedEnvelopes[1].entityKey).toBe('the-key-2');
        });
    });
});