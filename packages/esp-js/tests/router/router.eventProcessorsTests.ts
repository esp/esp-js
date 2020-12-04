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

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('eventProcessors', () => {
        let _model1: { },
            _model2: { },
            _model3: { },
            _model5: {
                preProcessCount: number,
                eventDispatchItems: {eventType:string, event: any, stage: esp.ObservationStage}[],
                eventDispatchedItems: {eventType:string, event: any, stage: esp.ObservationStage}[],
                postProcessCount: number,
                eventsProcessed: string[],
                preProcess: ()=> void;
                eventDispatch: (eventType: string, event: any, observationStage: esp.ObservationStage) => void,
                eventDispatched: (eventType: string, event: any, observationStage: esp.ObservationStage) => void,
                postProcess: (eventsProcessed: string[])=> void;
            },
            _model6: {},
            _modelsSentForPreProcessing = [],
            _eventsSentToDispatch = [],
            _eventsSentToDispatched = [],
            _modelsSentForPostProcessing = [],
            _options = {
                preEventProcessor: (model) => {
                    _modelsSentForPreProcessing.push(model);
                },
                eventDispatchProcessor: (model: any, eventType: string, event: any, stage: esp.ObservationStage) => {
                    _eventsSentToDispatch.push({model, eventType, event, stage});
                },
                eventDispatchedProcessor: (model: any, eventType: string, event: any, stage: esp.ObservationStage) => {
                    _eventsSentToDispatched.push({model, eventType, event, stage});
                },
                postEventProcessor: (model, eventsProcessed) => {
                    _modelsSentForPostProcessing.push({model, eventsProcessed});
                }
            };

        beforeEach(() => {
            _model1 = { };
            _model2 = { };
            _model3 = { };
            _model5 = {
                preProcessCount : 0,
                eventDispatchItems: [],
                eventDispatchedItems: [],
                postProcessCount : 0,
                eventsProcessed: [],
                preProcess() {
                    this.preProcessCount++;
                },
                eventDispatch(eventType: string, event: any, stage: esp.ObservationStage) {
                    this.eventDispatchItems.push({eventType, event, stage});
                },
                eventDispatched(eventType: string, event: any, stage: esp.ObservationStage) {
                    this.eventDispatchedItems.push({eventType, event, stage});
                },
                postProcess(eventsProcessed) {
                    this.postProcessCount++;
                    this.eventsProcessed = eventsProcessed;
                }
            };
             _model6 = { };
            _modelsSentForPreProcessing = [];
            _eventsSentToDispatch = [];
            _eventsSentToDispatched = [];
            _modelsSentForPostProcessing = [];

            _router.addModel('modelId1', _model1, _options);
            _router.addModel('modelId2', _model2, _options);
            _router.addModel('modelId3', _model3, _options);
            _router.addModel('modelId5', _model5);
            _router.addModel('modelId6', _model6, _options);

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

        function assertDispatchedItems(array: {eventType: string, event:any, stage:esp.ObservationStage}[]) {
            expect(array.length).toBe(3);
            expect(array[0].eventType).toEqual('startEvent');
            expect(array[0].event).toEqual('theEvent');
            expect(array[0].stage).toEqual(esp.ObservationStage.preview);
            expect(array[1].eventType).toEqual('startEvent');
            expect(array[1].event).toEqual('theEvent');
            expect(array[1].stage).toEqual(esp.ObservationStage.normal);
            expect(array[2].eventType).toEqual('startEvent');
            expect(array[2].event).toEqual('theEvent');
            expect(array[2].stage).toEqual(esp.ObservationStage.final);
        }

        it('calls preProcess() if the model has this method before processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.preProcessCount).toBe(1);
        });

        it('calls eventDispatch() if the model has this method before each event is dispatched', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            assertDispatchedItems(_model5.eventDispatchItems);
        });

        it('calls eventDispatched() if the model has this method after each event is dispatched', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            assertDispatchedItems(_model5.eventDispatchedItems);
        });

        it('calls eventDispatchProcessor() if the the function exists on the options given at registration time', () => {
            _router.publishEvent('modelId6', 'startEvent', 'theEvent');
            assertDispatchedItems(_eventsSentToDispatch);
        });

        it('calls eventDispatchedProcessor() if the the function exists on the options given at registration time', () => {
            _router.publishEvent('modelId6', 'startEvent', 'theEvent');
            assertDispatchedItems(_eventsSentToDispatched);
        });

        it('calls postProcess() if the model has this method after processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.postProcessCount).toBe(1);
        });

        it('postProcess() passes the events published to postProcess', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.eventsProcessed).toEqual(['startEvent']);
        });

        it('calls a models preProcess() function if the model is NOT observing the published event', () => {
            _router.publishEvent('modelId5', 'nothingListeningToThisEvent', 'theEventPayload');
            expect(_model5.preProcessCount).toBe(1);
        });

        it('calls a models postProcess() function if the model is NOT observing the published event', () => {
            _router.publishEvent('modelId5', 'nothingListeningToThisEvent', 'theEventPayload');
            expect(_model5.postProcessCount).toBe(1);
        });

        it('calls a models pre event processor even if the model is not observing the published event', () => {
            _router.publishEvent('modelId1', 'nothingListeningToThisEvent', 'theEventPayload');
            const passed = _modelsSentForPreProcessing.length === 1;
            expect(passed).toBe(true);
        });

        it('calls a models post event processor even if the model is not observing the published event', () => {
            _router.publishEvent('modelId1', 'nothingListeningToThisEvent', 'theEventPayload');
            const passed = _modelsSentForPostProcessing.length === 1;
            expect(passed).toBe(true);
        });

        it('calls a models post processors in order before processing the next models events', () => {
            /**
             * This test also assets that models get processed in the order they had events published to them.
             */

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
            _router.addModel('modelId4', _model1, { preEventProcessor : () => {_router.publishEvent('modelId4', 'Event2', 'theEvent'); } });
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
            _router.getEventObservable('modelId4', 'Event1').subscribe(({event, context, model}) => {
                eventReceived = true;
                eventWasRaisedInNewEventLoop = model.version ===2;
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(eventReceived).toBe(true);
            expect(eventWasRaisedInNewEventLoop).toBe(true);
        });
    });
});