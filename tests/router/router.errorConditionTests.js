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

    describe('error conditions', function() {

        var _eventReceivedCount = 0;
        var _updateReceivedCount = 0;
        var _model;

        beforeEach(()=> {
            _eventReceivedCount =0;
            _updateReceivedCount =0;
            _model = {
                throwAtPre: false,
                throwAtUpdate: false,
                throwAtPost: false,
                throwADispatch: false
            };
            _router.addModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model)  => {
                        if (model.throwAtPre) {
                            throw new Error("Boom:Pre");
                        }
                    },
                    postEventProcessor: (model) => {
                        if (model.throwAtPost) {
                            throw new Error("Boom:Post");
                        }
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').observe(
                (event, context, model) => {
                    _eventReceivedCount++;
                    if(model.throwADispatch) {
                        throw new Error("Boom:Dispatch");
                    }
                }
            );
            _router.getModelObservable('modelId1').observe(
                    model => {
                    _updateReceivedCount++;
                    if(model.throwAtUpdate) {
                        throw new Error("Boom:Update");
                    }
                }
            );
        });

        it('should halt and rethrow if a pre processor errors', () => {
            // halt and rethrow
            _model.throwAtPre = true;
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error("Boom:Pre"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
        });

        it('should halt and rethrow if an event stream handler errors ', () => {
            _model.throwADispatch = true;
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error("Boom:Dispatch"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Dispatch]"));
        });

        it('should halt and rethrow if a post processor errors', () => {
            _model.throwAtPost = true;
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error("Boom:Post"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Post]"));
        });

        it('should halt and rethrow if an update stream handler errors', () => {
            _model.throwAtUpdate = true;
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error("Boom:Update"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Update]"));
        });

        describe('when isHalted', () => {
            beforeEach(()=> {
                _model.throwAtPre = true;
                expect(() => {
                    _router.publishEvent('modelId1', 'Event1', { });
                }).toThrow(new Error("Boom:Pre"));
            });

            it('should throw on publish', () => {
                expect(() => {
                    _router.publishEvent('modelId1', 'Event1', 'payload');
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });

            it('should throw on getEventObservable()', () => {
                expect(() => {
                    _router.getModelObservable('modelId1').observe(() => {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });

            it('should throw on executeEvent()', () => {
                expect(() => {
                    _router.executeEvent('myEventType', {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });

            it('should throw on addModel()', () => {
                expect(() => {
                    _router.addModel('modelId2', {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });

            it('should throw on getModelObservable()', () => {
                expect(() => {
                    _router.getModelObservable('modelId1').observe(() => {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });
        });

        describe('when disposed', () => {
            beforeEach(()=> {
                _router.dispose();
            });

            it('should throw on publish', () => {
                expect(() => {
                    _router.publishEvent('modelId1', 'Event1', 'payload');
                }).toThrow(new Error("ESP router has been disposed"));
            });

            it('should throw on getEventObservable()', () => {
                expect(() => {
                    _router.getModelObservable('modelId1').observe(() => {});
                }).toThrow(new Error("ESP router has been disposed"));
            });

            it('should throw on executeEvent()', () => {
                expect(() => {
                    _router.executeEvent('myEventType', {});
                }).toThrow(new Error("ESP router has been disposed"));
            });

            it('should throw on addModel()', () => {
                expect(() => {
                    _router.addModel('modelId2', {});
                }).toThrow(new Error("ESP router has been disposed"));
            });

            it('should throw on getModelObservable()', () => {
                expect(() => {
                    _router.getModelObservable('modelId1').observe(() => {});
                }).toThrow(new Error("ESP router has been disposed"));
            });
        });
    });
});