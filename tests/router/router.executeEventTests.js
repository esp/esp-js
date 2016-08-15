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

    describe('.executeEvent()', () => {

        var _model1 = {},
            _model2 = {};

        function raiseStartEvent() {
            _router.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
        }
        beforeEach(() => {
            _model1 = {};
            _model2 = {};
            _router.addModel('modelId1', _model1);
            _router.addModel('modelId2', _model2);
            _router.getEventObservable('modelId1', 'triggerExecuteEvent').subscribe(() => {
                _router.executeEvent('ExecutedEvent', {});
            });
        });

        it('should only allow execute during processor and event dispatch stages', () => {
            var model1 = { value: ""}, updateStreamTestRan = false;
            _router.addModel(
                'myModel',
                model1,
                {
                    preEventProcessor: () => _router.executeEvent('ExecutedEvent', "a"),
                    postEventProcessor: () => _router.executeEvent('ExecutedEvent', "c")
                }
            );
            _router.getEventObservable('myModel', 'TriggerExecuteEvent').subscribe(()=> {
                _router.executeEvent('ExecutedEvent', "b");
            });
            _router.getEventObservable('myModel', 'ExecutedEvent').subscribe((event, eventContext, model) => {
                model.value += event;
            });
            _router.getModelObservable('myModel').subscribe(() => {
                updateStreamTestRan = true;
                expect(() => {
                    _router.executeEvent('ExecutedEvent', {});
                }).toThrow();
            });
            _router.publishEvent('myModel', 'TriggerExecuteEvent', 'theEvent');
            expect(model1.value).toEqual("abc");
            expect(updateStreamTestRan).toEqual(true);
        });

        it('should throw if an execute handler raises another event', () => {
            var didTest = false;
            _router.getEventObservable('modelId1', 'ExecutedEvent').subscribe(() => {
                didTest = true;
                expect(() => {
                    _router.publishEvent('modelId1', 'Event3', {});
                }).toThrow();
            });
            raiseStartEvent();
            expect(didTest).toEqual(true);
        });

        it('should execute the event against the current event loops model', () => {
            var actualModel;
            _router.getEventObservable('modelId1', 'ExecutedEvent').subscribe((event, eventContext, model) => {
                actualModel = model;
            });
            raiseStartEvent();
            expect(actualModel).toBeDefined();
            expect(actualModel).toBe(_model1);
        });

        it('should execute the event immediately', () => {
            var counter = 0, testPassed = false;
            _router.getEventObservable('modelId1', 'triggerExecuteEvent2').subscribe(() => {
                counter = 1;
                _router.executeEvent('ExecutedEvent', {});
                counter = 2;
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent').subscribe(() => {
                testPassed = counter === 1;
            });
            _router.publishEvent('modelId1', 'triggerExecuteEvent2', 'theEvent');
            testPassed = testPassed && counter === 2;
            expect(testPassed).toEqual(true);
        });

        it('should execute the event against all stages', () => {
            var previewReceived = false, normalReceived = false, committedReceived = false;
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'preview').subscribe(() => {
                previewReceived = true;
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'normal').subscribe((event, eventContext, model) => {
                normalReceived = true;
                eventContext.commit();
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'committed').subscribe(() => {
                committedReceived = true;
            });
            raiseStartEvent();
            expect(previewReceived).toEqual(true);
            expect(normalReceived).toEqual(true);
            expect(committedReceived).toEqual(true);
        });
    });
});