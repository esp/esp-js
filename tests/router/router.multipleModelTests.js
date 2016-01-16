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

    describe('multiple models', () => {

        var _model, _model2, _model1OptionsHelper, _model2OptionsHelper;

        beforeEach(() => {
            _model = { id: "model1"  };
            _model2 = { id : " model2" };
            _model1OptionsHelper = createOptionsHelper();
            _model2OptionsHelper = createOptionsHelper();
            _router.addModel(_model.id, _model, _model1OptionsHelper.options);
            _router.addModel(_model2.id, _model2, _model2OptionsHelper.options);
        });

        function createOptionsHelper() {
            var helper = {
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
            var receivedModel2, receivedEvent2, model1ReceivedEvent = false;
            _router.getEventObservable(_model.id, "fooEvent").observe(() => {
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
            var model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable(_model.id, "fooEvent").observe((event, context, model) => { /* noop */});
            _router.getEventObservable(_model2.id, "fooEvent").observe((event, context, model) => { /* noop */});
            _router.getModelObservable(_model.id).observe(() => {
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

        it('should raise a model changed when child\'s event workflow done', () => {
            var receivedModel, receivedEvent, workflowDone;
            _router.getEventObservable(_model.id, "fooEvent").observe((event, context, model) => { /* noop */});
            _router.getEventObservable(_model2.id, "modelChangedEvent").observe((event, context, model) => {
                receivedModel = model;
                receivedEvent = event;
                workflowDone = _model1OptionsHelper.modelsSentForPostProcessing.length === 1;
            });
            _router.publishEvent(_model.id, "fooEvent", 1);
            expect(receivedModel).toBe(_model2);
            expect(receivedEvent).toBeDefined();
            expect(receivedEvent.model).toBeDefined();
            expect(receivedEvent.model.id).toBe(_model.id);
            expect(receivedEvent.modelId).toBe(_model.id);
            expect(workflowDone).toEqual(true);
        });
    });
});