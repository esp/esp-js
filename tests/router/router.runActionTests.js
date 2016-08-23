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

    describe('.runAction()', () => {
        var _model1 = { },
            _model2 = {},
            _proto = {
                init(id) {
                    this.id = id;
                    this.counter = 0;
                    this.preProcessCount = 0;
                    this.postProcessCount = 0;
                    return this;
                },
                preProcess() {
                    this.preProcessCount++;
                },
                postProcess() {
                    this.postProcessCount++;
                }
            },
            model1ReceivedCount = 0,
            model2ReceivedCount = 0;

        beforeEach(() => {
            _model1 = Object.create(_proto).init('1');
            _model2 = Object.create(_proto).init('2');
            _router.addModel(_model1.id, _model1);
            _router.addModel(_model2.id, _model2);
            _router.getModelObservable(_model1.id).subscribe(() => {
                model1ReceivedCount++;
            });
            _router.getModelObservable(_model2.id).subscribe(() => {
                model2ReceivedCount++;
            });
            // reset these as observing the model above would have bumped them to 1
            model1ReceivedCount = 0;
            model2ReceivedCount = 0;
        });

        it('throws if modelId not a string', () => {
            expect(() => {
                _router.runAction(undefined, () =>{ });
            }).toThrow(new Error('modelId must be a string'));
            expect(() => {
                _router.runAction(null, () =>{ });
            }).toThrow(new Error('modelId must be a string'));
            expect(() => {
                _router.runAction({}, () =>{ });
            }).toThrow(new Error('modelId must be a string'));
            expect(() => {
                _router.runAction('', () =>{ });
            }).toThrow(new Error('modelId must not be empty'));
        });

        it('throws if action isn\'t a function', () => {
            expect(() => {
                _router.runAction(_model1.id, null);
            }).toThrow(new Error('the argument passed to runAction must be a function and can not be null|undefined'));
            expect(() => {
                _router.runAction(_model1.id, undefined);
            }).toThrow(new Error('the argument passed to runAction must be a function and can not be null|undefined'));
            expect(() => {
                _router.runAction(_model1.id, {});
            }).toThrow(new Error('the argument passed to runAction must be a function and can not be null|undefined'));
        });

        it('runs action for target model', () => {
            _router.runAction(_model1.id, () =>{
                // noop
            });
            expect(model1ReceivedCount).toBe(1);
            expect(model2ReceivedCount).toBe(0);
        });

        it('runs pre processor when running an action', () => {
            _router.runAction(_model1.id, () => {
                // noop
            });
            expect(_model1.preProcessCount).toBe(1);
            expect(_model2.preProcessCount).toBe(0);
        });

        it('passes correct model to run action function', () => {
            _router.runAction(_model1.id, model => {
                model.counter++;
            });
            expect(_model1.counter).toBe(1);
            expect(_model2.counter).toBe(0);
        });

        it('runs post processor when running an action', () => {
            _router.runAction(_model1.id, () => {
                // noop
            });
            expect(_model1.postProcessCount).toBe(1);
            expect(_model2.postProcessCount).toBe(0);
        });
    });
});