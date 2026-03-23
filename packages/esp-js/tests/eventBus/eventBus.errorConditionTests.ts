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

describe('EventBus', () => {

    let _bus;

    beforeEach(() => {
        _bus = new esp.EventBus();
    });

    describe('error conditions', function() {

        let _eventReceivedCount = 0;
        let _updateReceivedCount = 0;
        // Flags stored outside the model (which gets frozen by immer)
        let _flags = {
            throwAtPre: false,
            throwAtUpdate: false,
            throwAtPost: false,
            throwADispatch: false
        };

        beforeEach(()=> {
            _eventReceivedCount = 0;
            _updateReceivedCount = 0;
            _flags = { throwAtPre: false, throwAtUpdate: false, throwAtPost: false, throwADispatch: false };
            const model = {};
            _bus.modelBuilder('modelId1', model)
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
                    _eventReceivedCount++;
                    if (_flags.throwADispatch) {
                        throw new Error('Boom:Dispatch');
                    }
                })
                .build();
            _bus.getModelObservable('modelId1').subscribe(
                (model: any) => {
                    _updateReceivedCount++;
                    if (_flags.throwAtUpdate) {
                        throw new Error('Boom:Update');
                    }
                }
            );
        });

        it('should halt and rethrow if a pre processor errors', () => {
            // halt and rethrow
            _flags.throwAtPre = true;
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error('Boom:Pre'));
            // rethrow on reuse
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
        });

        it('should halt and rethrow if an event stream handler errors ', () => {
            _flags.throwADispatch = true;
            // halt and rethrow
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error('Boom:Dispatch'));
            // rethrow on reuse
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Dispatch]'));
        });

        it('should halt and rethrow if a post processor errors', () => {
            _flags.throwAtPost = true;
            // halt and rethrow
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error('Boom:Post'));
            // rethrow on reuse
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Post]'));
        });

        it('should halt and rethrow if an update stream handler errors', () => {
            _flags.throwAtUpdate = true;
            // halt and rethrow
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', { });
            }).toThrow(new Error('Boom:Update'));
            // rethrow on reuse
            expect(() => {
                _bus.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Update]'));
        });

        describe('when isHalted', () => {
            beforeEach(()=> {
                _flags.throwAtPre = true;
                expect(() => {
                    _bus.publishEvent('modelId1', 'Event1', { });
                }).toThrow(new Error('Boom:Pre'));
            });

            it('should throw on publish', () => {
                expect(() => {
                    _bus.publishEvent('modelId1', 'Event1', 'payload');
                }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
            });

            it('should throw on getModelObservable subscribe', () => {
                expect(() => {
                    _bus.getModelObservable('modelId1').subscribe(() => {});
                }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
            });

            it('should throw on executeEvent()', () => {
                expect(() => {
                    _bus.executeEvent('myEventType', {});
                }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
            });

            it('should throw on addModel()', () => {
                expect(() => {
                    registerModel(_bus, 'modelId2', {});
                }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
            });

            it('should throw on getModelObservable()', () => {
                expect(() => {
                    _bus.getModelObservable('modelId1').subscribe(() => {});
                }).toThrow(new Error('ESP event bus halted due to previous unhandled error [Error: Boom:Pre]'));
            });
        });

        describe('when disposed', () => {
            beforeEach(()=> {
                _bus.dispose();
            });

            it('should throw on publish', () => {
                expect(() => {
                    _bus.publishEvent('modelId1', 'Event1', 'payload');
                }).toThrow(new Error('ESP event bus has been disposed'));
            });

            it('should throw on getModelObservable subscribe', () => {
                expect(() => {
                    _bus.getModelObservable('modelId1').subscribe(() => {});
                }).toThrow(new Error('ESP event bus has been disposed'));
            });

            it('should throw on executeEvent()', () => {
                expect(() => {
                    _bus.executeEvent('myEventType', {});
                }).toThrow(new Error('ESP event bus has been disposed'));
            });

            it('should throw on addModel()', () => {
                expect(() => {
                    registerModel(_bus, 'modelId2', {});
                }).toThrow(new Error('ESP event bus has been disposed'));
            });

            it('should throw on getModelObservable()', () => {
                expect(() => {
                    _bus.getModelObservable('modelId1').subscribe(() => {});
                }).toThrow(new Error('ESP event bus has been disposed'));
            });
        });
    });
});
