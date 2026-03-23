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
import {registerModel} from '../testApi/testHelpers';

describe('Router', () => {

    let _router;
    let _onErrorHandler;
    let _onErrorHandlerCallCount = 0;

    const ignoreErrors = action => {
        try {
            action();
        } catch(e) {}
    };

    beforeEach(() => {
        _router = new esp.Router();
        _onErrorHandlerCallCount = 0;
        _onErrorHandler = () => {
            _onErrorHandlerCallCount++;
        };
        _router.addOnErrorHandler(_onErrorHandler);
    });

    describe('onErrorHandler tests', function() {

        // Flags stored outside the model (which gets frozen by immer)
        let _flags = {
            throwAtPre: false,
            throwAtUpdate: false,
            throwAtPost: false,
            throwADispatch: false
        };

        beforeEach(()=> {
            _flags = { throwAtPre: false, throwAtUpdate: false, throwAtPost: false, throwADispatch: false };
            _router.modelBuilder('modelId1', {})
                .withPreEventProcessor(() => {
                    if (_flags.throwAtPre) {
                        throw new Error('Boom:Pre');
                    }
                })
                .withPostEventProcessor(() => {
                    if (_flags.throwAtPost) {
                        throw new Error('Boom:Post');
                    }
                })
                .withEventHandler('Event1', (draft, event, ctx) => {
                    if (_flags.throwADispatch) {
                        throw new Error('Boom:Dispatch');
                    }
                })
                .build();
            _router.getModelObservable('modelId1').subscribe(
                (model: any) => {
                    if (_flags.throwAtUpdate) {
                        throw new Error('Boom:Update');
                    }
                }
            );
        });

        describe('onErrorHandler mutation tests', () => {
            it('should not call an errorHandler once removed', () => {
                _router.removeOnErrorHandler(_onErrorHandler);
                _flags.throwAtPre = true;
                ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('Should throw trying to remove a handler that does not exist', () => {
                expect(() => {
                    _router.removeOnErrorHandler(() => {});
                }).toThrow(new Error('Unknown error handler.'));
            });

            it('Should ignore errors from onErrorHandlers', () => {
                _router.removeOnErrorHandler(_onErrorHandler);

                let hasRun = false;
                let handler1 = e => { throw new Error('Hello'); };
                let handler2 = e => hasRun = true;
                _router.addOnErrorHandler(handler1);
                _router.addOnErrorHandler(handler2);

                _flags.throwAtPre = true;
                ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
                expect(hasRun).toEqual(true);
            });
        });

        it('should call onErrorHandler and rethrow if a pre processor errors', () => {
            _flags.throwAtPre = true;
            ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
            expect(_onErrorHandlerCallCount).toEqual(1);
        });

        it('should call onErrorHandler and rethrow if an event stream handler errors ', () => {
            _flags.throwADispatch = true;
            ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
            expect(_onErrorHandlerCallCount).toEqual(1);
        });

        it('should call onErrorHandler and rethrow if a post processor errors', () => {
            _flags.throwAtPost = true;
            ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
            expect(_onErrorHandlerCallCount).toEqual(1);
        });

        it('should call onErrorHandler and rethrow if an update stream handler errors', () => {
            _flags.throwAtUpdate = true;
            ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', { }));
            expect(_onErrorHandlerCallCount).toEqual(1);
        });

        describe('when isHalted', () => {
            beforeEach(()=> {
                _flags.throwAtPre = true;
                expect(() => {
                    _router.publishEvent('modelId1', 'Event1', { });
                }).toThrow(new Error('Boom:Pre'));
                _onErrorHandlerCallCount = 0;
            });

            it('should not call onErrorHandler on publish', () => {
                ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', 'payload'));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on getModelObservable subscribe', () => {
                ignoreErrors(() => _router.getModelObservable('modelId1').subscribe(() => {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on executeEvent()', () => {
                ignoreErrors(() => _router.executeEvent('myEventType', {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on addModel()', () => {
                ignoreErrors(() => registerModel(_router, 'modelId2', {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on getModelObservable()', () => {
                ignoreErrors(() => _router.getModelObservable('modelId1').subscribe(() => {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });
        });

        describe('when disposed', () => {
            beforeEach(()=> {
                _router.dispose();
            });

            it('should not call onErrorHandler on publish', () => {
                ignoreErrors(() => _router.publishEvent('modelId1', 'Event1', 'payload'));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on getModelObservable subscribe', () => {
                ignoreErrors(() => _router.getModelObservable('modelId1').subscribe(() => {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on executeEvent()', () => {
                ignoreErrors(() => _router.executeEvent('myEventType', {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on addModel()', () => {
                ignoreErrors(() => registerModel(_router, 'modelId2', {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });

            it('should not call onErrorHandler on getModelObservable()', () => {
                ignoreErrors(() => _router.getModelObservable('modelId1').subscribe(() => {}));
                expect(_onErrorHandlerCallCount).toEqual(0);
            });
        });
    });
});
