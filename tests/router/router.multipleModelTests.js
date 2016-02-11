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

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('multiple models', () => {

        let _model1,
            _model2,
            _model3,
            _model1OptionsHelper,
            _model2OptionsHelper,
            _model3OptionsHelper;

        beforeEach(() => {
            _model1 = { id: "model1"  };
            _model2 = { id : " model2" };
            _model3 = { id : " model3" };
            _model1OptionsHelper = createOptionsHelper();
            _model2OptionsHelper = createOptionsHelper();
            _model3OptionsHelper = createOptionsHelper();
            _router.addModel(_model1.id, _model1, _model1OptionsHelper.options);
            _router.addModel(_model2.id, _model2, _model2OptionsHelper.options);
            _router.addModel(_model3.id, _model3, _model3OptionsHelper.options);
        });

        function createOptionsHelper() {
            let helper = {
                modelsSentForPreProcessing : [],
                modelsSentForPostProcessing : [],
                options : {
                    preEventProcessor: (model) => {
                        helper.modelsSentForPreProcessing.push(model);
                    },
                    postEventProcessor: (model) => {
                        helper.modelsSentForPostProcessing.push(model);
                    }
                }
            };
            return helper;
        }

        it('should deliver correct model and event to target event observers', () => {
            let receivedModel2, receivedEvent2, model1ReceivedEvent = false;
            _router.getEventObservable(_model1.id, "fooEvent").observe(() => {
                model1ReceivedEvent = true;
            });
            _router.getEventObservable(_model2.id, "fooEvent").observe((event, context, model) => {
                receivedModel2 = model;
                receivedEvent2 = event;
            });
            _router.publishEvent(_model2.id, "fooEvent", 1);
            expect(receivedModel2).toBeDefined();
            expect(receivedModel2).toBe(_model2);
            expect(receivedEvent2).toBeDefined();
            expect(receivedEvent2).toEqual(1);
            expect(model1ReceivedEvent).toBe(false);

        });

        it('should dispatch updates for the child model only', () => {
            let model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable(_model1.id, "fooEvent").observe((event, context, model) => { /* noop */});
            _router.getEventObservable(_model2.id, "fooEvent").observe((event, context, model) => { /* noop */});
            _router.getModelObservable(_model1.id).observe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toEqual(0);
            _router.getModelObservable(_model2.id).observe(() => {
                model2UpdateCount++;
            });
            expect(model2UpdateCount).toEqual(0);
            _router.publishEvent(_model2.id, "fooEvent", 1);
            expect(model1UpdateCount).toEqual(0);
            expect(model2UpdateCount).toEqual(1);
        });

        describe('model changed events', () => {
            let _receivedModel, _receivedEvent, _workflowDone;

            it('throws if you observe a modelChangedEvent using a string identifier', () => {
                expect(() => {
                    _router.getEventObservable(_model2.id, 'modelChangedEvent').observe((event, context, model) => {});
                }).toThrow(new Error("You can not observe a modelChangedEvent using only the eventType string. You must pass an object identifying the modelId to monitor. E.g. replace the eventType param with: { eventType: 'modelChangedEvent', modelId: 'yourRelatedModelId' }"));
            });

            it('can observe a modelChangedEvent when child\'s event workflow done', () => {
                _router.getEventObservable(_model1.id, "fooEvent").observe((event, context, model) => { /* noop */});
                _router.getEventObservable(_model2.id, { eventType: "modelChangedEvent", modelId: _model1.id }).observe((event, context, model) => {
                    _receivedModel = model;
                    _receivedEvent = event;
                    _workflowDone = _model1OptionsHelper.modelsSentForPostProcessing.length === 1;
                });
                _router.publishEvent(_model1.id, "fooEvent", 1);
                expect(_receivedModel).toBe(_model2);
                expect(_receivedEvent).toBeDefined();
                expect(_receivedEvent.model).toBeDefined();
                expect(_receivedEvent.model.id).toBe(_model1.id);
                expect(_receivedEvent.modelId).toBe(_model1.id);
                expect(_workflowDone).toEqual(true);
            });

            it('multiple models can observe other models', () => {
                // model 2 observes model 1
                let _model2ReceivedItems = [],
                    _model3ReceivedItems = [];
                _router.getEventObservable(_model1.id, "fooEvent").observe((event, context, model) => { /* noop */});
                _router.getEventObservable(_model2.id, { eventType: "modelChangedEvent", modelId: _model1.id }).observe((event, context, model) => {
                    _model2ReceivedItems.push({event, context, model});
                });
                // model 3 observes model 1 and 2
                _router.getEventObservable(_model3.id, { eventType: "modelChangedEvent", modelId: _model1.id }).observe((event, context, model) => {
                    _model3ReceivedItems.push({event, context, model});
                });
                _router.getEventObservable(_model3.id, { eventType: "modelChangedEvent", modelId: _model2.id }).observe((event, context, model) => {
                    _model3ReceivedItems.push({event, context, model});
                });
                _router.publishEvent(_model1.id, "fooEvent", 1);

                expect(_model2ReceivedItems.length).toBe(1);
                expect(_model3ReceivedItems.length).toBe(2);
            });

            xit('detects and errors when models are observing each other', () => {
                _router.getEventObservable(_model1.id, "fooEvent").observe((event, context, model) => { /* noop */});
                _router.getEventObservable(_model1.id, { eventType: "modelChangedEvent", modelId: _model2.id }).observe((event, context, model) => {
                });
                _router.getEventObservable(_model2.id, { eventType: "modelChangedEvent", modelId: _model1.id }).observe((event, context, model) => {
                });
                _router.publishEvent(_model1.id, "fooEvent", 1);
            });
        });
    });
});