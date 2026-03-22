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

import {Router, DefaultModelAddress, EventContext} from '../../src';
import {ModelBuilder} from '../../src/model/modelBuilder';
import {registerModel} from '../testApi/testHelpers';

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
            new ModelBuilder(_router, 'modelId1', {})
                .withEventHandler('startEvent', () => {
                    // publish events for other models while processing modelId1
                    _router.publishEvent('modelId2', 'Event1', 'theEvent'); // should be processed second
                    _router.publishEvent('modelId1', 'Event1', 'theEvent'); // should be processed first
                })
                .withEventHandler('Event1', () => {
                    model1ProcessorReceived++;
                })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId2', {})
                .withEventHandler('Event1', () => {
                    testPassed = model1ProcessorReceived === 1;
                })
                .registerWithRouter();
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
        });

        it('should reset the EventContext for each event', () => {
            let testPassed = false;
            let lastEventDelivered = false;
            new ModelBuilder(_router, 'modelId1', {})
                .withEventHandler('startEvent', (draft, event, ctx) => {
                    ctx.commit();
                    _router.publishEvent('modelId1', 'Event1', 'theEvent1');
                    _router.publishEvent('modelId1', 'Event2', 'theEvent2');
                    _router.publishEvent('modelId1', 'Event3', 'theEvent3');
                })
                .withEventHandler('Event1', (draft, event, ctx) => {
                    testPassed = ctx.isCommitted === false;
                    ctx.commit();
                })
                .withEventHandler('Event2', (draft, event, ctx) => {
                    testPassed = testPassed && ctx.isCommitted === false;
                    ctx.commit();
                })
                .withEventHandler('Event3', (draft, event, ctx) => {
                    testPassed = testPassed && ctx.isCommitted === false;
                    lastEventDelivered = true;
                })
                .registerWithRouter();
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
            expect(lastEventDelivered).toBe(true);
        });

        it('should throw if you publish without registering the model', () => {
            expect(() => {
                _router.publishEvent('fooModel', 'startEvent', 'start');
            }).toThrow();

            let receivedEvents: any[] = [];
            new ModelBuilder(_router, 'fooModel', {})
                .withEventHandler('startEvent', (draft, event) => { receivedEvents.push(event); })
                .registerWithRouter();

            _router.publishEvent('fooModel', 'startEvent', 'start');

            expect(receivedEvents.length).toEqual(1);
        });

        it('can publish with ModelAddress and DefaultModelAddress', () => {
            let handlerCallCount = 0;
            new ModelBuilder(_router, 'modelId1', {})
                .withEventHandler('startEvent', () => { handlerCallCount++; })
                .registerWithRouter();
            _router.publishEvent({ modelId: 'modelId1' }, 'startEvent', 'theEvent');
            expect(handlerCallCount).toBe(1);
            _router.publishEvent(new DefaultModelAddress('modelId1'), 'startEvent', 'theEvent');
            expect(handlerCallCount).toBe(2);
        });

        it('can publish including entityKey', () => {
            let receivedEntityKeys: (string | undefined)[] = [];
            new ModelBuilder(_router, 'modelId1', {})
                .withEventHandler('startEvent', (draft, event, ctx) => {
                    receivedEntityKeys.push(ctx.entityKey);
                })
                .registerWithRouter();
            _router.publishEvent({ modelId: 'modelId1', entityKey: 'the-key-1' }, 'startEvent', 'theEvent');
            expect(receivedEntityKeys.length).toBe(1);
            expect(receivedEntityKeys[0]).toBe('the-key-1');
            _router.publishEvent(new DefaultModelAddress('modelId1', 'the-key-2'), 'startEvent', 'theEvent');
            expect(receivedEntityKeys.length).toBe(2);
            expect(receivedEntityKeys[1]).toBe('the-key-2');
        });
    });
});
