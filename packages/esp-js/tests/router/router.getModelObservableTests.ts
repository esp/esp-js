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
import {registerModel} from '../testApi/testHelpers';

describe('Router', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.getModelObservable()', () => {

        beforeEach(() => {
            _router.modelBuilder('modelId1', {number:0})
                .withEventHandler('Event1', () => {})
                .build();
            _router.modelBuilder('modelId2', {number:0})
                .withEventHandler('Event1', () => {})
                .build();
        });

        it('throws if arguments incorrect', () => {
            expect(() => {_router.getModelObservable(undefined).subscribe(() => {}); }).toThrow(new Error('The modelId should be a string'));
            expect(() => {_router.getModelObservable(<any>{}).subscribe(() => {}); }).toThrow(new Error('The modelId should be a string'));
        });

        it('dispatches model once registered', () => {
            let model3UpdateCount = 0;
            _router.modelBuilder('modelId3', {number:0}).build();
            _router.getModelObservable('modelId1').subscribe(() => {
                model3UpdateCount++;
            });
            expect(model3UpdateCount).toBe(1);
        });

        it('dispatches model updates to observers by modelid', () => {
            let model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.getModelObservable('modelId2').subscribe(() => {
                model2UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            _router.publishEvent('modelId2', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            expect(model2UpdateCount).toBe(2);
        });

        it('doesn\'t dispatch to disposed update observers', () => {
            let model1UpdateCount = 0;
            let disposable = _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
        });

        it('dispatches model updates after that models event queue is empty, but before processing next model', () => {
            let model1UpdateCount = 0,
                model2UpdateCount = 0,
                model1EventCount = 0,
                model2EventCount = 0,
                check1 = false,
                check2 = false;
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            _router.getModelObservable('modelId2').subscribe(() => {
                model2UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
            expect(model2UpdateCount).toBe(1);

            // We need a new model setup for this test since modelId1/2 are already registered
            const router2 = new esp.Router();
            let m1UpdateCount = 0, m2UpdateCount = 0, m1EventCount = 0, m2EventCount = 0;
            let c1 = false, c2 = false;
            router2.modelBuilder('modelId1', {number: 0})
                .withEventHandler('StartEvent', () => {
                    router2.publishEvent('modelId1', 'Event1', 1);
                    router2.publishEvent('modelId2', 'Event1', 2);
                    router2.publishEvent('modelId1', 'Event1', 3);
                    router2.publishEvent('modelId2', 'Event1', 4);
                })
                .withEventHandler('Event1', () => {
                    m1EventCount++;
                    c1 = m1UpdateCount === 1 && m2UpdateCount === 1;
                })
                .build();
            router2.modelBuilder('modelId2', {number: 0})
                .withEventHandler('Event1', () => {
                    m2EventCount++;
                    c2 = m1UpdateCount === 2 && m2UpdateCount === 1 && m1EventCount === 2;
                })
                .build();
            router2.getModelObservable('modelId1').subscribe(() => { m1UpdateCount++; });
            router2.getModelObservable('modelId2').subscribe(() => { m2UpdateCount++; });
            expect(m1UpdateCount).toBe(1);
            expect(m2UpdateCount).toBe(1);
            router2.publishEvent('modelId1', 'StartEvent', 'payload');
            expect(m1UpdateCount).toEqual(2);
            expect(m1EventCount).toEqual(2);
            expect(m2UpdateCount).toEqual(2);
            expect(m2EventCount).toEqual(2);
            expect(c1).toEqual(true);
            expect(c2).toEqual(true);
        });

        it('processes events published during model dispatch', () => {
            let event2Received = false;
            let publishedEvent2 = false;
            // modelId1 already has Event1 handler registered in beforeEach
            // Need a new router for this test to add Event2 handler
            const router2 = new esp.Router();
            router2.modelBuilder('modelId1', {number: 0})
                .withEventHandler('Event1', () => {})
                .withEventHandler('Event2', () => {
                    event2Received = true;
                })
                .build();
            router2.getModelObservable('modelId1').subscribe(() => {
                if (!publishedEvent2) {
                    publishedEvent2 = true;
                    router2.publishEvent('modelId1', 'Event2', 1);
                }
            });
            router2.publishEvent('modelId1', 'Event1', 'payload');
            expect(event2Received).toBe(true);
        });

        it('only dispatches changes for models which processed an event', () => {
            // Uses fresh router to avoid conflicts with beforeEach registered models
            const router2 = new esp.Router();
            let m1UpdateCount = 0, m2UpdateCount = 0;
            router2.modelBuilder('modelId1', {number: 0})
                .withEventHandler('Event1', () => {})
                .build();
            router2.modelBuilder('modelId2', {number: 0})
                .withEventHandler('StartEvent', () => {
                    router2.publishEvent('modelId2', 'Event1', 'payload');
                })
                .withEventHandler('Event1', () => {})
                .build();
            router2.getModelObservable('modelId1').subscribe(() => { m1UpdateCount++; });
            expect(m1UpdateCount).toBe(1);
            router2.getModelObservable('modelId2').subscribe(() => { m2UpdateCount++; });
            expect(m2UpdateCount).toBe(1);
            router2.publishEvent('modelId2', 'StartEvent', 'payload');
            expect(m1UpdateCount).toBe(1);
            expect(m2UpdateCount).toBe(2);
        });

        it('does not dispatches changes when publishing to a model that is not listening to said event', () => {
            // Uses a fresh router since we need a model without any Event1 handler
            const router2 = new esp.Router();
            let m1UpdateCount = 0;
            router2.modelBuilder('modelId1', {number: 0})
                .withEventHandler('StartEvent', () => {})
                .build();
            router2.getModelObservable('modelId1').subscribe(() => { m1UpdateCount++; });
            expect(m1UpdateCount).toBe(1);
            // publish an event the model does NOT listen to — no model update
            router2.publishEvent('modelId1', 'NotObservedEvent', 'payload');
            expect(m1UpdateCount).toBe(1);
            // now publish an event the model DOES listen to
            router2.publishEvent('modelId1', 'StartEvent', 'payload');
            expect(m1UpdateCount).toBe(2);
        });

        it.skip('should dispatch change to models if event if only one event was processed', () => {
            // there is a condition whereby the first processors processes the event flagging the model as dirty,
            // but the second event doesn't get processed which un flags the prior event
        });

        it('should pump the last model on observation', () => {
            let model1UpdateCount = 0, model1UpdateCount2 = 0;
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount2++;
            });
            expect(model1UpdateCount).toBe(2);
            expect(model1UpdateCount2).toBe(1);
        });

        it('should pump the last model on first observation after first event', () => {
            // this is a different edge case to the 'should pump the last model on observation'
            // it appears that there was a bug whereby if there are no model observers and an event loop completes,
            // the router/subject doesn't set the streams model as there are no observers.
            let model1UpdateCount = 0;
            expect(model1UpdateCount).toBe(0);
            _router.publishEvent('modelId1', 'Event1', 'payload');
            _router.getModelObservable('modelId1').subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
        });
    });
});
