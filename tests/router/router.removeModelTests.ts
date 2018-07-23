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

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.removeModel()', () => {

        let _preProcessorReceivedCount = 0;
        let _eventReceivedCount1 = 0;
        let _eventReceivedCount2 = 0;
        let _postProcessorReceivedCount = 0;
        let _updateReceivedCount1 = 0;
        let _updateReceivedCount2 = 0;
        let _model;

        beforeEach(()=> {
            _model = {
                removeAtPre: false,
                removeAtUpdate: false,
                removeAtPost: false,
                removeAtDispatch: false
            };
            _router.addModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model) => {
                        _preProcessorReceivedCount++;
                        if (model.removeAtPre) {
                            _router.removeModel('modelId1');
                        }
                    },
                    postEventProcessor : (model) => {
                        _postProcessorReceivedCount++;
                        if(model.removeAtPost) {
                            _router.removeModel('modelId1');
                        }
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').subscribe(({event, context, model}) => {
                _eventReceivedCount1++;
                if(model.removeAtDispatch) {
                    _router.removeModel('modelId1');
                }
            });
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                _eventReceivedCount2++;
            });
            _router.getModelObservable('modelId1').subscribe(model => {
                _updateReceivedCount1++;
                if(model.removeAtUpdate) {
                    _router.removeModel('modelId1');
                }
            });
            _router.getModelObservable('modelId1').subscribe(() => {
                _updateReceivedCount2++;
            });
            // the model gets pumped on initial observe so reset these here
            _preProcessorReceivedCount = 0;
            _eventReceivedCount1 =0;
            _eventReceivedCount2 =0;
            _postProcessorReceivedCount  =0;
            _updateReceivedCount1 = 0;
            _updateReceivedCount2 = 0;
        });

        it('throws if arguments incorrect', () => {
            expect(() => {_router.removeModel(); }).toThrow(new Error('The modelId argument should be a string'));
        });

        it('should onComplete all event streams when the model is removed', () => {
            let didComplete = false;
            _router.getEventObservable('modelId1', 'Event1').subscribe(
                () => {},
                () => didComplete = true
            );
            _router.removeModel('modelId1');
            expect(didComplete).toEqual(true);
        });

        it('should onComplete all update streams when the model is removed', () => {
            let didComplete = false;
            _router.getModelObservable('modelId1').subscribe(
                () => {},
                () => didComplete = true
            );
            _router.removeModel('modelId1');
            expect(didComplete).toEqual(true);
        });

        describe('model deletion during the event processing workflow', () => {

            function expectReceived(options) {
                expect(_preProcessorReceivedCount).toEqual(options.atPre);
                expect(_eventReceivedCount1).toEqual(options.atEvent1);
                expect(_eventReceivedCount2).toEqual(options.atEvent2);
                expect(_postProcessorReceivedCount).toEqual(options.atPost);
                expect(_updateReceivedCount1).toEqual(options.atUpdate1);
                expect(_updateReceivedCount2).toEqual(options.atUpdate2);
            }

            it('should allow a preprocessor to removeModel', () => {
                _model.removeAtPre = true;
                _router.publishEvent('modelId1', 'Event1', { });
                expectReceived({
                    atPre: 1,
                    atEvent1: 0,
                    atEvent2: 0,
                    atPost: 0,
                    atUpdate1: 0,
                    atUpdate2: 0
                });
            });

            it('should allow an eventProcessor to removeModel', () => {
                _model.removeAtDispatch = true;
                _router.publishEvent('modelId1', 'Event1', { });
                expectReceived({
                    atPre: 1,
                    atEvent1: 1,
                    atEvent2: 0,
                    atPost: 0,
                    atUpdate1: 0,
                    atUpdate2: 0
                });
            });

            it('should allow a postprocessor to removeModel', () => {
                _model.removeAtPost = true;
                _router.publishEvent('modelId1', 'Event1', { });
                expectReceived({
                    atPre: 1,
                    atEvent1: 1,
                    atEvent2: 1,
                    atPost: 1,
                    atUpdate1: 0,
                    atUpdate2: 0
                });
            });

            it('should allow a model update observer to removeModel', () => {
                _model.removeAtUpdate = true;
                _router.publishEvent('modelId1', 'Event1', { });
                expectReceived({
                    atPre: 1,
                    atEvent1: 1,
                    atEvent2: 1,
                    atPost: 1,
                    atUpdate1: 1,
                    atUpdate2: 0
                });
            });
        });
    });
});