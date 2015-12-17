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

import esp from '../../src/index';

describe('Router', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('eventProcessors', () => {
        var _model1 = {},
            _model2 = {},
            _model3 = {},
            _model5 = {},
            _testPassed = false,
            _modelsSentForPreProcessing = [],
            _modelsSentForPostProcessing = [],
            _options = {
                preEventProcessor: (model) => {
                    _modelsSentForPreProcessing.push(model);
                },
                postEventProcessor: (model) => {
                    _modelsSentForPostProcessing.push(model);
                }
            };

        beforeEach(() => {
            _model1 = { id: 1 };
            _model2 = { id: 2 };
            _model3 = { id: 3};
            _model5 = {
                preProcessCount : 0,
                postProcessCount : 0,
                preProcess() {
                    this.preProcessCount++;
                },
                postProcess() {
                    this.postProcessCount++;
                }
            };
            _testPassed = false;
            _modelsSentForPreProcessing = [];
            _modelsSentForPostProcessing = [];

            _router.addModel('modelId1', _model1, _options);
            _router.addModel('modelId2', _model2, _options);
            _router.addModel('modelId3', _model3, _options);
            _router.addModel('modelId5', _model5);

            _router.getEventObservable('modelId1', 'startEvent').observe(() => {
                _router.publishEvent('modelId3', 'Event1', 'theEvent');
                _router.publishEvent('modelId2', 'Event1', 'theEvent');
                _router.publishEvent('modelId1', 'Event1', 'theEvent');
            });
            _router.getEventObservable('modelId5', 'startEvent').observe(() => {
                /* noop */
            });
        });

        it('calls preProcess() if the model has this method before processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.preProcessCount).toBe(1);
        });

        it('calls postProcess() if the model has this method before processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.postProcessCount).toBe(1);
        });

        it('calls a models post processors before processing the next models events', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                /* noop */
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                _testPassed = _modelsSentForPostProcessing.length === 1 && _modelsSentForPostProcessing[0] === _model1;
            });
            _router.getEventObservable('modelId3', 'Event1').observe(() => {
                _testPassed = _testPassed && _modelsSentForPostProcessing.length === 2 && _modelsSentForPostProcessing[1] === _model2;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            _testPassed = _testPassed && _modelsSentForPostProcessing.length === 3 && _modelsSentForPostProcessing[2] === _model3;
            expect(_testPassed).toBe(true);
        });

        it('calls a models pre processors before dispatching to processors', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                _testPassed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(_testPassed).toBe(true);
        });

        it('only calls the pre event processor for the model the event was targeted at', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _testPassed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            expect(_testPassed).toBe(true);
        });

        it('should allow a preEventProcessor to publish an event', () => {
            _router.addModel('modelId4', _model1, { preEventProcessor : () => {_router.publishEvent('modelId4', 'Event2', 'theEvent'); } });
            var wasPublished = false;
            _router.getEventObservable('modelId4', 'Event2').observe(() => {
                wasPublished = true;
            });
            _router.getEventObservable('modelId4', 'Event1').observe(() => {
                /* noop */
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(wasPublished).toEqual(true);
        });

        it('should allow a postEventProcessor to publishs an event', () => {
            var eventReceived = false,
                eventWasRaisedInNewEventLoop = false,
                postProcessorPublished = false;
            _router.addModel(
                'modelId4',
                { version: 1 }, // model
                {
                    preEventProcessor : (model) => { model.version++; },
                    postEventProcessor : () => {
                        if(!postProcessorPublished) {
                            postProcessorPublished = true;
                            _router.publishEvent('modelId4', 'Event2', 'theEvent2');
                        }
                    }
                });
            _router.getEventObservable('modelId4', 'Event1').observe((event, eventContext, model) => {
                eventReceived = true;
                eventWasRaisedInNewEventLoop = model.version ===2;
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(eventReceived).toBe(true);
            expect(eventWasRaisedInNewEventLoop).toBe(true);
        });
    });
});