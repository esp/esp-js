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
import {ModelBuilder} from '../../src/model/modelBuilder';
import {registerModel} from '../testApi/testHelpers';

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('eventProcessors', () => {
        let _model1: {},
            _model2: {},
            _model3: {},
            _model5: {},
            _model6: {},
            _modelsSentForPreProcessing = [],
            _modelsSentForPostProcessing = [],
            _model5PreProcessCount = 0,
            _model5PostProcessCount = 0,
            _model5EventsProcessed: string[] = [];

        beforeEach(() => {
            _model1 = { };
            _model2 = { };
            _model3 = { };
            _model5 = { };
            _model6 = { };
            _modelsSentForPreProcessing = [];
            _modelsSentForPostProcessing = [];
            _model5PreProcessCount = 0;
            _model5PostProcessCount = 0;
            _model5EventsProcessed = [];

            new ModelBuilder(_router, 'modelId1', _model1)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({model, eventsProcessed}); })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId2', _model2)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({model, eventsProcessed}); })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId3', _model3)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({model, eventsProcessed}); })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId5', _model5)
                .withPreEventProcessor(() => { _model5PreProcessCount++; })
                .withPostEventProcessor((model, eventsProcessed) => { _model5PostProcessCount++; _model5EventsProcessed = eventsProcessed; })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId6', _model6)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({model, eventsProcessed}); })
                .registerWithRouter();

            _router.getEventObservable('modelId1', 'startEvent').subscribe(() => {
                _router.publishEvent('modelId3', 'Event1', 'theEvent');
                _router.publishEvent('modelId2', 'Event1', 'theEvent');
                _router.publishEvent('modelId1', 'Event1', 'theEvent');
            });

            _router.getEventObservable('modelId5', 'startEvent').subscribe(() => {
                /* noop */
            });

            _router.getEventObservable('modelId6', 'startEvent').subscribe(() => {
                /* noop */
            });
        });

        it('calls pre processor before processing the first event (via withPreEventProcessor)', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5PreProcessCount).toBe(1);
        });

        it('calls post processor after processing the first event (via withPostEventProcessor)', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5PostProcessCount).toBe(1);
        });

        it('postProcess() passes the events published to postProcess', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5EventsProcessed).toEqual(['startEvent']);
        });

        it('does not call preEventProcessor if the model is NOT observing the published event', () => {
            _router.publishEvent('modelId5', 'nothingListeningToThisEvent', 'theEventPayload');
            expect(_model5PreProcessCount).toBe(0);
        });

        it('does not call postEventProcessor if the model is NOT observing the published event', () => {
            _router.publishEvent('modelId5', 'nothingListeningToThisEvent', 'theEventPayload');
            expect(_model5PostProcessCount).toBe(0);
        });

        it('does not call a models pre event processor if the model is not observing the published event', () => {
            _router.publishEvent('modelId1', 'nothingListeningToThisEvent', 'theEventPayload');
            const passed = _modelsSentForPreProcessing.length === 0;
            expect(passed).toBe(true);
        });

        it('does not call a models post event processor if the model is not observing the published event', () => {
            _router.publishEvent('modelId1', 'nothingListeningToThisEvent', 'theEventPayload');
            const passed = _modelsSentForPostProcessing.length === 0;
            expect(passed).toBe(true);
        });

        it('calls a models post processors in order before processing the next models events', () => {
            let passed = true, callbackCount = 0;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                callbackCount++;
            });
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => {
                callbackCount++;
                passed = passed && _modelsSentForPostProcessing.length === 2 && _modelsSentForPostProcessing[1].model === _model3;
            });
            _router.getEventObservable('modelId3', 'Event1').subscribe(() => {
                callbackCount++;
                passed = passed && _modelsSentForPostProcessing.length === 1 && _modelsSentForPostProcessing[0].model === _model1;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            passed = passed && _modelsSentForPostProcessing.length === 3 && _modelsSentForPostProcessing[2].model === _model2;
            expect(passed).toBe(true);
            expect(callbackCount).toBe(3);
        });

        it('calls a models pre processors before dispatching to processors', () => {
            let passed = false;
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                passed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(passed).toBe(true);
        });

        it('only calls the pre event processor for the model the event was targeted at', () => {
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            const passed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            expect(passed).toBe(true);
        });

        it('should allow a preEventProcessor to publish an event', () => {
            new ModelBuilder(_router, 'modelId4', _model1)
                .withPreEventProcessor(() => { _router.publishEvent('modelId4', 'Event2', 'theEvent'); })
                .registerWithRouter();
            let wasPublished = false;
            _router.getEventObservable('modelId4', 'Event2').subscribe(() => {
                wasPublished = true;
            });
            _router.getEventObservable('modelId4', 'Event1').subscribe(() => {
                /* noop */
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(wasPublished).toEqual(true);
        });

        it('should allow a postEventProcessor to publish an event', () => {
            let eventReceived = false,
                postProcessorPublished = false,
                preProcessorCalledCount = 0;
            const innerModel = { version: 1 };
            new ModelBuilder(_router, 'modelId4', innerModel)
                .withPreEventProcessor(() => { preProcessorCalledCount++; })
                .withPostEventProcessor(() => {
                    if (!postProcessorPublished) {
                        postProcessorPublished = true;
                        _router.publishEvent('modelId4', 'Event2', 'theEvent2');
                    }
                })
                .registerWithRouter();
            _router.getEventObservable('modelId4', 'Event1').subscribe(({event, context, model}: any) => {
                eventReceived = true;
            });
            _router.getEventObservable('modelId4', 'Event2').subscribe(() => {
                /* observe Event2 so it can be enqueued when postProcessor publishes it */
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(eventReceived).toBe(true);
            // preProcessor was called twice (once for Event1, once for Event2)
            expect(preProcessorCalledCount).toBe(2);
        });
    });
});
