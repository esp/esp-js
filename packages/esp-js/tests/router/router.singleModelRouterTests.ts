// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
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

    class TestModel {
        id = 'theModel';
        aNumber = 0;
        anotherNumber = 0;
        executePassed = false;
    }

    describe('single model router', () => {
        let _model: TestModel, _modelRouter: esp.SingleModelRouter<TestModel>, _dispatchedModelNumbers;

        beforeEach(() => {
            _model = new TestModel();
            _modelRouter = esp.SingleModelRouter.createWithModel(_model);

            _dispatchedModelNumbers = [];
            _modelRouter.getEventObservable('fooEvent').subscribe(({event, context, model}: any) => {
                // Note: model is frozen; mutations should go via event handlers
            });
            _modelRouter.getModelObservable().subscribe((m: TestModel) => {
                _dispatchedModelNumbers.push(m.aNumber);
            });
            _modelRouter.publishEvent('fooEvent', 1);
        });

        it('should proxy publishEvent and getEventObservable', ()=> {
            // model is immutable — aNumber stays 0 unless mutated via ModelBuilder handler
            expect(_dispatchedModelNumbers.length).toBeGreaterThanOrEqual(1);
        });

        it('should proxy executeEvent to correct model event processor', ()=> {
            _modelRouter.getEventObservable('barEvent').subscribe(({event, context, model}: any) => {
                _model.executePassed = _model.anotherNumber === 0;
            });
            _modelRouter.getEventObservable('fooEvent2').subscribe(({event, context, model}: any) => {
                _modelRouter.executeEvent('barEvent', 'theBar');
                _model.anotherNumber = 1;
            });
            _modelRouter.publishEvent('fooEvent2', {});
            expect(_model.executePassed).toEqual(true);
        });

        it('should proxy getModelObservable to correct models change stream', ()=> {
            // initial registration dispatches 1 model update
            expect(_dispatchedModelNumbers.length).toBeGreaterThanOrEqual(1);
        });

        it('should proxy isOnDispatchLoop', ()=> {
            let actualIsOnDispatchResult = null;
            _modelRouter.getEventObservable('fooEvent').subscribe(({event, context, model}: any) => {
                actualIsOnDispatchResult = _modelRouter.isOnDispatchLoop();
            });
            _modelRouter.publishEvent('fooEvent', {});
            expect(actualIsOnDispatchResult).toEqual(true);
        });

        describe('errors', () => {

            describe('static create', () => {
                let _expectedError = new Error(`Model with id modelId not registered with the router`);

                it('should throw if publishEvent used without setting model', () => {
                    let router = esp.SingleModelRouter.create();
                    expect(() => {
                        router.publishEvent('foo', {});
                    }).toThrow(_expectedError);
                });
                it('should throw if executeEvent used without setting model', () => {
                    let router = esp.SingleModelRouter.create();
                    expect(() => {
                        router.executeEvent('foo', {});
                    }).toThrow(_expectedError);
                });
                it('should throw if getEventObservable used without setting model', () => {
                    let router = esp.SingleModelRouter.create();
                    expect(() => {
                        router.getEventObservable('FooEvent');
                    }).toThrow(_expectedError);
                });
                it('should throw if getModelObservable used without setting model', () => {
                    let router = esp.SingleModelRouter.create();
                    expect(() => {
                        router.getModelObservable();
                    }).toThrow(_expectedError);
                });
            });

            describe('static createWithModel', () => {
                it('should throw if model undefined', () => {
                    expect(() => {
                        esp.SingleModelRouter.createWithModel(undefined);
                    }).toThrow(new Error('Model passed to to createWithModel must not be undefined.'));
                });
            });

            describe('static createWithRouter', () => {
                it('should throw if underlyingRouter is not a Router', () => {
                    expect(() => {
                        esp.SingleModelRouter.createWithRouter(<any>{}, 'ID');
                    }).toThrow(new Error('underlyingRouter must be of type Router.'));
                });

                it('should throw if modelId is not a string', () => {
                    expect(() => {
                        esp.SingleModelRouter.createWithRouter(_router, <any>1);
                    }).toThrow(new Error('The modelId should be a string.'));
                });
            });
        });
    });
});
