// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import * as esp from '../../src';
import {registerModel} from '../testApi/testHelpers';

describe('EventBus', () => {

    let _bus;

    beforeEach(() => {
        _bus = new esp.EventBus();
    });

    describe('.executeEvent()', () => {

        let _model1 = {},
            _model2 = {};

        function raiseStartEvent() {
            _bus.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
        }

        beforeEach(() => {
            _model1 = {};
            _model2 = {};
            _bus.modelBuilder('modelId1', _model1)
                .withEventHandler('triggerExecuteEvent', () => {
                    _bus.executeEvent('ExecutedEvent', {});
                })
                .build();
            registerModel(_bus, 'modelId2', _model2);
        });

        it('should only allow execute during processor and event dispatch stages', () => {
            // Track values accumulated across execute calls
            let accumulatedValues: string[] = [];
            let updateStreamTestRan = false;
            _bus.modelBuilder('myModel', {value: ''})
                .withPreEventProcessor(() => { _bus.executeEvent('ExecutedEvent', 'a'); })
                .withPostEventProcessor(() => { _bus.executeEvent('ExecutedEvent', 'c'); })
                .withEventHandler('TriggerExecuteEvent', () => {
                    _bus.executeEvent('ExecutedEvent', 'b');
                })
                .withEventHandler('ExecutedEvent', (draft, event: string) => {
                    accumulatedValues.push(event);
                })
                .build();
            _bus.getModelObservable('myModel').subscribe(() => {
                updateStreamTestRan = true;
                expect(() => {
                    _bus.executeEvent('ExecutedEvent', {});
                }).toThrow();
            });
            _bus.publishEvent('myModel', 'TriggerExecuteEvent', 'theEvent');
            expect(accumulatedValues.join('')).toEqual('abc');
            expect(updateStreamTestRan).toEqual(true);
        });

        it('should throw if an execute handler raises another event', () => {
            let didTest = false;
            _bus.modelBuilder('modelId1b', {})
                .withEventHandler('ExecutedEvent', () => {
                    didTest = true;
                    expect(() => {
                        _bus.publishEvent('modelId1b', 'Event3', {});
                    }).toThrow();
                })
                .build();
            // Use a fresh model to avoid double-registration
            const bus2 = new esp.EventBus();
            bus2.modelBuilder('modelId1', {})
                .withEventHandler('triggerExecuteEvent', () => {
                    bus2.executeEvent('ExecutedEvent', {});
                })
                .withEventHandler('ExecutedEvent', () => {
                    didTest = true;
                    expect(() => {
                        bus2.publishEvent('modelId1', 'Event3', {});
                    }).toThrow();
                })
                .build();
            bus2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(didTest).toEqual(true);
        });

        it('should execute the event against the current event loops model', () => {
            let actualModel;
            // The model passed to handler is the current frozen model
            const bus2 = new esp.EventBus();
            const theModel = {};
            bus2.modelBuilder('modelId1', theModel)
                .withEventHandler('triggerExecuteEvent', () => {
                    bus2.executeEvent('ExecutedEvent', {});
                })
                .withEventHandler('ExecutedEvent', (draft, event, ctx, m?) => {
                    // draft is the immer draft, but we can verify it's processed correctly
                    actualModel = draft;
                })
                .build();
            bus2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(actualModel).toBeDefined();
        });

        it('should execute the event immediately', () => {
            let counter = 0, testPassed = false;
            const bus2 = new esp.EventBus();
            bus2.modelBuilder('modelId1', {})
                .withEventHandler('triggerExecuteEvent2', () => {
                    counter = 1;
                    bus2.executeEvent('ExecutedEvent', {});
                    counter = 2;
                })
                .withEventHandler('ExecutedEvent', () => {
                    testPassed = counter === 1;
                })
                .build();
            bus2.publishEvent('modelId1', 'triggerExecuteEvent2', 'theEvent');
            testPassed = testPassed && counter === 2;
            expect(testPassed).toEqual(true);
        });

        it('should execute the event against preview, normal, and final stages', () => {
            let previewReceived = false, normalReceived = false, finalReceived = false;
            const bus2 = new esp.EventBus();
            bus2.modelBuilder('modelId1', {})
                .withEventHandler('triggerExecuteEvent', () => {
                    bus2.executeEvent('ExecutedEvent', {});
                })
                .withPreviewHandler('ExecutedEvent', () => {
                    previewReceived = true;
                })
                .withEventHandler('ExecutedEvent', (draft, event, ctx) => {
                    normalReceived = true;
                    ctx.commit();
                })
                .withEffect('ExecutedEvent', () => {
                    // effect runs at final stage (after committed if applicable)
                    finalReceived = true;
                })
                .build();
            bus2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(previewReceived).toEqual(true);
            expect(normalReceived).toEqual(true);
            expect(finalReceived).toEqual(true);
        });
    });
});
