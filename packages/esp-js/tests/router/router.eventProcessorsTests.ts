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

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('eventProcessors', () => {
        let _model1: {_id?: string},
            _model2: {_id?: string},
            _model3: {_id?: string},
            _model5: {},
            _model6: {},
            _modelsSentForPreProcessing = [],
            _modelsSentForPostProcessing = [],
            _model5PreProcessCount = 0,
            _model5PostProcessCount = 0,
            _model5EventsProcessed: string[] = [];

        // Counts for the 'calls a models post processors in order' test
        let _model1Event1Count = 0;
        let _model2Event1Count = 0;
        let _model3Event1Count = 0;
        let _model1PreEventPreProcessingLen = 0;

        beforeEach(() => {
            _model1 = { _id: 'model1' };
            _model2 = { _id: 'model2' };
            _model3 = { _id: 'model3' };
            _model5 = { };
            _model6 = { };
            _modelsSentForPreProcessing = [];
            _modelsSentForPostProcessing = [];
            _model5PreProcessCount = 0;
            _model5PostProcessCount = 0;
            _model5EventsProcessed = [];
            _model1Event1Count = 0;
            _model2Event1Count = 0;
            _model3Event1Count = 0;
            _model1PreEventPreProcessingLen = 0;

            new ModelBuilder(_router, 'modelId1', _model1)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model._id); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('startEvent', () => {
                    _router.publishEvent('modelId3', 'Event1', 'theEvent');
                    _router.publishEvent('modelId2', 'Event1', 'theEvent');
                    _router.publishEvent('modelId1', 'Event1', 'theEvent');
                })
                .withEventHandler('Event1', () => {
                    _model1Event1Count++;
                    _model1PreEventPreProcessingLen = _modelsSentForPreProcessing.length;
                })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId2', _model2)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model._id); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('Event1', () => {
                    _model2Event1Count++;
                })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId3', _model3)
                .withPreEventProcessor((model) => { _modelsSentForPreProcessing.push(model._id); })
                .withPostEventProcessor((model, eventsProcessed) => { _modelsSentForPostProcessing.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('Event1', () => {
                    _model3Event1Count++;
                })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId5', _model5)
                .withPreEventProcessor(() => { _model5PreProcessCount++; })
                .withPostEventProcessor((model, eventsProcessed) => { _model5PostProcessCount++; _model5EventsProcessed = eventsProcessed; })
                .withEventHandler('startEvent', () => { /* noop */ })
                .registerWithRouter();
            new ModelBuilder(_router, 'modelId6', _model6)
                .withPreEventProcessor((model: any) => { _modelsSentForPreProcessing.push(model._id); })
                .withPostEventProcessor((model: any, eventsProcessed) => { _modelsSentForPostProcessing.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('startEvent', () => { /* noop */ })
                .registerWithRouter();
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
            let passed = true;
            // modelId3's Event1 handler checks that modelId1's postProcessor ran before modelId3's
            new ModelBuilder(_router, 'modelId3Check', _model3)
                .withEventHandler('Event1', () => {
                    passed = passed && _modelsSentForPostProcessing.length === 1 && _modelsSentForPostProcessing[0].modelId === 'model1';
                })
                .registerWithRouter();

            // We need to verify the ordering — reuse the _model3Event1Count to detect
            // When model3 processes Event1: postProcessing should have only model1's postProcessor called
            // When model2 processes Event1: postProcessing should have model1's + model3's postProcessors called
            // This is checked via the _modelsSentForPostProcessing array

            // Actually the beforeEach already sets up event handlers for model1, 2, 3 with appropriate callbacks.
            // The startEvent handler on modelId1 publishes to modelId3, modelId2, modelId1 in that order.
            // After model1 processes startEvent: postProcessor for model1 fires → _modelsSentForPostProcessing[0].model === _model1
            // Then model3 processes Event1: at that point _modelsSentForPostProcessing has 1 entry (model1)
            // Then model2 processes Event1: at that point _modelsSentForPostProcessing has 2 entries (model1, model3)
            // Then model1 processes Event1: at that point _modelsSentForPostProcessing has 3 entries (model1, model3, model2)

            let model3Passed = false;
            let model2Passed = false;

            // Rebuild using fresh router since models are already registered
            const router2 = new esp.Router();
            const m1 = {_id: 'm1'}, m2 = {_id: 'm2'}, m3 = {_id: 'm3'};
            const postProcessors = [];

            new ModelBuilder(router2, 'modelId1', m1)
                .withPreEventProcessor((model) => {})
                .withPostEventProcessor((model: any, eventsProcessed) => { postProcessors.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('startEvent', () => {
                    router2.publishEvent('modelId3', 'Event1', 'theEvent');
                    router2.publishEvent('modelId2', 'Event1', 'theEvent');
                    router2.publishEvent('modelId1', 'Event1', 'theEvent');
                })
                .withEventHandler('Event1', () => {})
                .registerWithRouter();
            new ModelBuilder(router2, 'modelId2', m2)
                .withPostEventProcessor((model: any, eventsProcessed) => { postProcessors.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('Event1', () => {
                    model2Passed = postProcessors.length === 2 && postProcessors[1].modelId === 'm3';
                })
                .registerWithRouter();
            new ModelBuilder(router2, 'modelId3', m3)
                .withPostEventProcessor((model: any, eventsProcessed) => { postProcessors.push({modelId: model._id, eventsProcessed}); })
                .withEventHandler('Event1', () => {
                    model3Passed = postProcessors.length === 1 && postProcessors[0].modelId === 'm1';
                })
                .registerWithRouter();
            router2.publishEvent('modelId1', 'startEvent', 'theEvent');
            passed = passed && model3Passed && model2Passed;
            passed = passed && postProcessors.length === 3 && postProcessors[2].modelId === 'm2';
            expect(passed).toBe(true);
        });

        it('calls a models pre processors before dispatching to processors', () => {
            let passed = false;
            // modelId1 already has a pre-event-processor registered that adds to _modelsSentForPreProcessing
            // The Event1 handler on modelId1 checks the length
            // Re-use the counter captured during Event1 dispatch
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            // When Event1 fires on modelId1, preProcessor should have been called (adding model1)
            passed = _model1PreEventPreProcessingLen === 1 && _modelsSentForPreProcessing[0] === 'model1';
            expect(passed).toBe(true);
        });

        it('only calls the pre event processor for the model the event was targeted at', () => {
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            const passed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === 'model1';
            expect(passed).toBe(true);
        });

        it('should allow a preEventProcessor to publish an event', () => {
            let wasPublished = false;
            new ModelBuilder(_router, 'modelId4', _model1)
                .withPreEventProcessor(() => { _router.publishEvent('modelId4', 'Event2', 'theEvent'); })
                .withEventHandler('Event1', () => { /* noop */ })
                .withEventHandler('Event2', () => { wasPublished = true; })
                .registerWithRouter();
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
                .withEventHandler('Event1', () => { eventReceived = true; })
                .withEventHandler('Event2', () => { /* observe Event2 so it can be enqueued when postProcessor publishes it */ })
                .registerWithRouter();
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(eventReceived).toBe(true);
            // preProcessor was called twice (once for Event1, once for Event2)
            expect(preProcessorCalledCount).toBe(2);
        });
    });
});
