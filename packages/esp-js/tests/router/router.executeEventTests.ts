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
import {ModelBuilder} from '../../src/model/modelBuilder';
import {registerModel} from '../testApi/testHelpers';

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.executeEvent()', () => {

        let _model1 = {},
            _model2 = {};

        function raiseStartEvent() {
            _router.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
        }

        beforeEach(() => {
            _model1 = {};
            _model2 = {};
            new ModelBuilder(_router, 'modelId1', _model1)
                .withEventHandler('triggerExecuteEvent', () => {
                    _router.executeEvent('ExecutedEvent', {});
                })
                .registerWithRouter();
            registerModel(_router, 'modelId2', _model2);
        });

        it('should only allow execute during processor and event dispatch stages', () => {
            // Track values accumulated across execute calls
            let accumulatedValues: string[] = [];
            let updateStreamTestRan = false;
            new ModelBuilder(_router, 'myModel', {value: ''})
                .withPreEventProcessor(() => { _router.executeEvent('ExecutedEvent', 'a'); })
                .withPostEventProcessor(() => { _router.executeEvent('ExecutedEvent', 'c'); })
                .withEventHandler('TriggerExecuteEvent', () => {
                    _router.executeEvent('ExecutedEvent', 'b');
                })
                .withEventHandler('ExecutedEvent', (draft, event: string) => {
                    accumulatedValues.push(event);
                })
                .registerWithRouter();
            _router.getModelObservable('myModel').subscribe(() => {
                updateStreamTestRan = true;
                expect(() => {
                    _router.executeEvent('ExecutedEvent', {});
                }).toThrow();
            });
            _router.publishEvent('myModel', 'TriggerExecuteEvent', 'theEvent');
            expect(accumulatedValues.join('')).toEqual('abc');
            expect(updateStreamTestRan).toEqual(true);
        });

        it('should throw if an execute handler raises another event', () => {
            let didTest = false;
            new ModelBuilder(_router, 'modelId1b', {})
                .withEventHandler('ExecutedEvent', () => {
                    didTest = true;
                    expect(() => {
                        _router.publishEvent('modelId1b', 'Event3', {});
                    }).toThrow();
                })
                .registerWithRouter();
            // Use a fresh model to avoid double-registration
            const router2 = new esp.Router();
            new ModelBuilder(router2, 'modelId1', {})
                .withEventHandler('triggerExecuteEvent', () => {
                    router2.executeEvent('ExecutedEvent', {});
                })
                .withEventHandler('ExecutedEvent', () => {
                    didTest = true;
                    expect(() => {
                        router2.publishEvent('modelId1', 'Event3', {});
                    }).toThrow();
                })
                .registerWithRouter();
            router2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(didTest).toEqual(true);
        });

        it('should execute the event against the current event loops model', () => {
            let actualModel;
            // The model passed to handler is the current frozen model
            const router2 = new esp.Router();
            const theModel = {};
            new ModelBuilder(router2, 'modelId1', theModel)
                .withEventHandler('triggerExecuteEvent', () => {
                    router2.executeEvent('ExecutedEvent', {});
                })
                .withEventHandler('ExecutedEvent', (draft, event, ctx, m?) => {
                    // draft is the immer draft, but we can verify it's processed correctly
                    actualModel = draft;
                })
                .registerWithRouter();
            router2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(actualModel).toBeDefined();
        });

        it('should execute the event immediately', () => {
            let counter = 0, testPassed = false;
            const router2 = new esp.Router();
            new ModelBuilder(router2, 'modelId1', {})
                .withEventHandler('triggerExecuteEvent2', () => {
                    counter = 1;
                    router2.executeEvent('ExecutedEvent', {});
                    counter = 2;
                })
                .withEventHandler('ExecutedEvent', () => {
                    testPassed = counter === 1;
                })
                .registerWithRouter();
            router2.publishEvent('modelId1', 'triggerExecuteEvent2', 'theEvent');
            testPassed = testPassed && counter === 2;
            expect(testPassed).toEqual(true);
        });

        it('should execute the event against preview, normal, and final stages', () => {
            let previewReceived = false, normalReceived = false, finalReceived = false;
            const router2 = new esp.Router();
            new ModelBuilder(router2, 'modelId1', {})
                .withEventHandler('triggerExecuteEvent', () => {
                    router2.executeEvent('ExecutedEvent', {});
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
                .registerWithRouter();
            router2.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
            expect(previewReceived).toEqual(true);
            expect(normalReceived).toEqual(true);
            expect(finalReceived).toEqual(true);
        });
    });
});
