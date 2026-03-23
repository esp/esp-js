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

describe('EventBus', () => {

    let _bus;

    beforeEach(() => {
        _bus = new esp.EventBus();
    });

    describe('multiple models', () => {

        let _model1,
            _model2,
            _model3,
            _model1OptionsHelper,
            _model2OptionsHelper,
            _model3OptionsHelper;

        // Track which model received the event and what event was received
        let _receivedModel2 = null;
        let _receivedEvent2 = null;
        let _model1ReceivedEvent = false;

        beforeEach(() => {
            _model1 = { id: 'model1'  };
            _model2 = { id: ' model2' };
            _model3 = { id: ' model3' };
            _receivedModel2 = null;
            _receivedEvent2 = null;
            _model1ReceivedEvent = false;
            _model1OptionsHelper = createOptionsHelper();
            _model2OptionsHelper = createOptionsHelper();
            _model3OptionsHelper = createOptionsHelper();
            _bus.modelBuilder(_model1.id, _model1)
                .withPreEventProcessor(_model1OptionsHelper.options.preEventProcessor)
                .withPostEventProcessor(_model1OptionsHelper.options.postEventProcessor)
                .withEventHandler('fooEvent', () => {
                    _model1ReceivedEvent = true;
                })
                .build();
            _bus.modelBuilder(_model2.id, _model2)
                .withPreEventProcessor(_model2OptionsHelper.options.preEventProcessor)
                .withPostEventProcessor(_model2OptionsHelper.options.postEventProcessor)
                .withEventHandler<number>('fooEvent', (draft, event, ctx) => {
                    _receivedModel2 = _model2;
                    _receivedEvent2 = event;
                })
                .build();
            _bus.modelBuilder(_model3.id, _model3)
                .withPreEventProcessor(_model3OptionsHelper.options.preEventProcessor)
                .withPostEventProcessor(_model3OptionsHelper.options.postEventProcessor)
                .build();
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
            _bus.publishEvent(_model2.id, 'fooEvent', 1);
            expect(_receivedModel2).toBeDefined();
            expect(_receivedModel2).toBe(_model2);
            expect(_receivedEvent2).toBeDefined();
            expect(_receivedEvent2).toEqual(1);
            expect(_model1ReceivedEvent).toBe(false);
        });

        it('should dispatch updates for the child model only', () => {
            let model1UpdateCount = 0, model2UpdateCount = 0;
            _bus.getModelObservable(_model1.id).subscribe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toEqual(1);
            _bus.getModelObservable(_model2.id).subscribe(() => {
                model2UpdateCount++;
            });
            expect(model2UpdateCount).toEqual(1);
            _bus.publishEvent(_model2.id, 'fooEvent', 1);
            expect(model1UpdateCount).toEqual(1);
            expect(model2UpdateCount).toEqual(2);
        });
    });
});
