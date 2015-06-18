/*
 * Copyright 2015 Keith Woods
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

"use strict";

import esp from '../../';

describe('Router', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.registerModel()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.registerModel(undefined, 'foo'); }).toThrow();
            expect(() => {_router.registerModel('foo', undefined); }).toThrow();
            expect(() => {_router.registerModel('foo', {}, 'not a function'); }).toThrow();
            expect(() => {_router.registerModel({ },{ }); }).toThrow(new Error('The modelId argument should be a string'));
            expect(() => {_router.registerModel("modelId", { },"notSomeOptions"); }).toThrow(new Error('The options argument should be an object'));
            expect(() => {_router.registerModel("modelId", { }, { preEventProcessor: {} }); }).toThrow(new Error('preEventProcessor should be a function or an object with a process() function'));
            expect(() => {_router.registerModel("modelId", { }, { preEventProcessor: "boo" }); }).toThrow(new Error('preEventProcessor should be a function or an object with a process() function'));
            expect(() => {_router.registerModel("modelId", { }, { postEventProcessor:{}}); }).toThrow(new Error('postEventProcessor should be a function or an object with a process() function'));
            expect(() => {_router.registerModel("modelId", { }, { postEventProcessor:"boo"}); }).toThrow(new Error('postEventProcessor should be a function or an object with a process() function'));
        });

        it('should throw if model already registered', () => {
            _router.registerModel('modelId', {});
            expect(() => {_router.registerModel('modelId', {}); }).toThrow(new Error('The model with id [modelId] is already registered'));
        });
    });

    describe('.removeModel()', () => {

        var _preProcessorReceivedCount = 0;
        var _eventReceivedCount1 = 0;
        var _eventReceivedCount2 = 0;
        var _postProcessorReceivedCount = 0;
        var _updateReceivedCount1 = 0;
        var _updateReceivedCount2 = 0;
        var _model;

        beforeEach(()=> {
            _preProcessorReceivedCount = 0;
            _eventReceivedCount1 =0;
            _eventReceivedCount2 =0;
            _postProcessorReceivedCount  =0;
            _updateReceivedCount1 = 0;
            _updateReceivedCount2 = 0;
            _model = {
                removeAtUpdate: false
            };
            _router.registerModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model, event) => {
                        _preProcessorReceivedCount++;
                        if (event.removeAtPre) {
                            _router.removeModel('modelId1');
                        }
                    },
                    postEventProcessor : (model, event) => {
                        _postProcessorReceivedCount++;
                        if(event.removeAtPost) {
                            _router.removeModel('modelId1');
                        }
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').observe((model, event) => {
                _eventReceivedCount1++;
                if(event.removeAtDispatch) {
                    _router.removeModel('modelId1');
                }
                model.removeAtUpdate = event.removeAtUpdate;
            });
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                _eventReceivedCount2++;
            });
            _router.getModelObservable('modelId1').observe(model => {
                _updateReceivedCount1++;
                if(model.removeAtUpdate) {
                    _router.removeModel('modelId1');
                }
            });
            _router.getModelObservable('modelId1').observe(() => {
                _updateReceivedCount2++;
            });
        });

        it('throws if arguments incorrect', () => {
            expect(() => {_router.removeModel(); }).toThrow(new Error("The modelId argument should be a string"));
        });

        it('should onComplete all event streams when the model is removed', () => {
            var didComplete = false;
            _router.getEventObservable('modelId1', 'Event1').observe(
                () => {},
                () => {},
                () => didComplete = true
            );
            _router.removeModel('modelId1');
            expect(didComplete).toEqual(true);
        });

        it('should onComplete all update streams when the model is removed', () => {
            var didComplete = false;
            _router.getModelObservable('modelId1').observe(
                () => {},
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
                _router.publishEvent('modelId1', 'Event1', { removeAtPre: true });
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
                _router.publishEvent('modelId1', 'Event1', { removeAtDispatch: true });
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
                _router.publishEvent('modelId1', 'Event1', { removeAtPost: true });
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
                _router.publishEvent('modelId1', 'Event1', { removeAtUpdate: true });
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

    describe('.broadcast()', function() {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.broadcastEvent(undefined, 'foo'); }).toThrow();
            expect(() => {_router.broadcastEvent('anEvent', undefined); }).toThrow();
        });

        it('should deliver the event to all models', () => {
            var model1ProcessorReceived = 0, model2ProcessorReceived = 0;
            _router.registerModel('modelId1', {});
            _router.registerModel('modelId2', {});
            _router.getEventObservable('modelId1', 'Event1').observe((model, event) => {
                model1ProcessorReceived+=event;
            });
            _router.getEventObservable('modelId2', 'Event1').observe((model, event) => {
                model2ProcessorReceived+=event;
            });
            _router.broadcastEvent('Event1', 10);
            expect(model1ProcessorReceived).toEqual(10);
            expect(model2ProcessorReceived).toEqual(10);
        });
    });

    describe('.publishEvent()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.publishEvent(undefined, 'Foo', 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', undefined, 'Foo'); }).toThrow();
            expect(() => {_router.publishEvent('Foo', 'Foo', undefined); }).toThrow();
            expect(() => {_router.publishEvent({ },'foo', 'foo'); }).toThrow(new Error('The modelId argument should be a string'));
        });

        it('queues and processes events received during event loop by model id', () => {
            var model1ProcessorReceived = 0, testPassed = false;
            _router.registerModel('modelId1', {});
            _router.registerModel('modelId2', {});
            _router.getEventObservable('modelId1', 'startEvent').observe(() => {
                // publish an event for modelId2 while processing modelId1, thus queuing them
                _router.publishEvent('modelId2', 'Event1', 'theEvent'); // should be processed second
                _router.publishEvent('modelId1', 'Event1', 'theEvent'); // should be processed first
            });
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                model1ProcessorReceived++;
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                testPassed = model1ProcessorReceived === 1;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
        });

        it('should reset the EventContext for each event', () => {
            var testPassed = false;
            _router.registerModel('modelId1', {});
            _router.getEventObservable('modelId1', 'startEvent').observe(() => {
                _router.publishEvent('modelId1', 'Event1', 'theEvent1');
                _router.publishEvent('modelId1', 'Event2', 'theEvent2');
                _router.publishEvent('modelId1', 'Event3', 'theEvent3');
            });
            _router.getEventObservable('modelId1', 'Event1').observe((model, event, eventContext) => {
                testPassed = eventContext.eventType === "Event1";
            });
            _router.getEventObservable('modelId2', 'Event2').observe((model, event, eventContext) => {
                testPassed = testPassed && eventContext.eventType === "Event2";
            });
            _router.getEventObservable('modelId2', 'Event3').observe((model, event, eventContext) => {
                testPassed = testPassed && eventContext.eventType === "Event3";
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
        });

        it('should copy custom properties on eventContext.custom', () => {
            pending();
        });
    });

    describe('eventProcessors', () => {
        var _model1 = {},
            _model2 = {},
            _model3 = {},
            _testPassed = false,
            _modelsSentForPreProcessing = [],
            _modelsSentForPostProcessing = [],
            _options = {
                preEventProcessor: (model, event, eventContext) => {
                    _modelsSentForPreProcessing.push(model);
                },
                postEventProcessor: (model, event, eventContext) => {
                    _modelsSentForPostProcessing.push(model);
                }
            };

        beforeEach(() => {
            _model1 = { id: 1 };
            _model2 = { id: 2 };
            _model3 = { id: 3};
            _testPassed = false;
            _modelsSentForPreProcessing = [];
            _modelsSentForPostProcessing = [];

            _router.registerModel('modelId1', _model1, _options);
            _router.registerModel('modelId2', _model2, _options);
            _router.registerModel('modelId3', _model3, _options);

            _router.getEventObservable('modelId1', 'startEvent').observe(() => {
                _router.publishEvent('modelId3', 'Event1', 'theEvent');
                _router.publishEvent('modelId2', 'Event1', 'theEvent');
                _router.publishEvent('modelId1', 'Event1', 'theEvent');
            });
        });

        it('calls a models post processors before processing the next models events', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                /* noop */
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                _testPassed = _modelsSentForPostProcessing.length === 1 && _modelsSentForPostProcessing[0] === _model1;
            });
            _router.getEventObservable('modelId3', 'Event1').observe(() => {
                _testPassed = _testPassed && _modelsSentForPostProcessing.length === 2 && _modelsSentForPostProcessing[1] === _model2;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            _testPassed = _testPassed && _modelsSentForPostProcessing.length === 3 && _modelsSentForPostProcessing[2] === _model3;
            expect(_testPassed).toBe(true);
        });

        it('calls a models pre processors before dispatching to processors', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                _testPassed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(_testPassed).toBe(true);
        });

        it('only calls the pre event processor for the model the event was targeted at', () => {
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            _testPassed = _modelsSentForPreProcessing.length === 1 && _modelsSentForPreProcessing[0] === _model1;
            expect(_testPassed).toBe(true);
        });

        it('should allow a preEventProcessor to publish an event', () => {
            _router.registerModel('modelId4', _model1, { preEventProcessor : () => {_router.publishEvent('modelId4', 'Event2', 'theEvent'); } });
            var wasPublished = false;
            _router.getEventObservable('modelId4', 'Event2').observe(() => {
               wasPublished = true;
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(wasPublished).toEqual(true);
        });

        it('should allow a postEventProcessor to publishs an event', () => {
            var eventReceived = false,
                eventWasRaisedInNewEventLoop = false,
                postProcessorPublished = false;
            _router.registerModel(
                'modelId4',
                { version: 1 }, // model
                {
                    preEventProcessor : (model, event, eventContext) => { model.version++; },
                    postEventProcessor : () => {
                        if(!postProcessorPublished) {
                            postProcessorPublished = true;
                            _router.publishEvent('modelId4', 'Event2', 'theEvent2');
                        }
                    }
                });
            _router.getEventObservable('modelId4', 'Event1').observe((model, event, eventContext) => {
                eventReceived = true;
                eventWasRaisedInNewEventLoop = model.version ===2;
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(eventReceived).toBe(true);
            expect(eventWasRaisedInNewEventLoop).toBe(true);
        });

        it('should cancel the event if a preprocessor calls cancel', () => {
            var calledCancel = false, processorReceived = false;
            _router.registerModel('modelId4', _model1, { preEventProcessor : (model, event, eventContext) => {
                calledCancel = true;
                eventContext.cancel();
            }});
            _router.getEventObservable('modelId4', 'Event1').observe(() => {
                processorReceived = true;
            });
            _router.publishEvent('modelId4', 'Event1', 'theEvent');
            expect(calledCancel).toEqual(true);
            expect(processorReceived).toEqual(false);
        });
    });

    describe('.executeEvent()', () => {

        var _model1 = {},
            _model2 = {};

        function raiseStartEvent() {
            _router.publishEvent('modelId1', 'triggerExecuteEvent', 'theEvent');
        }
        beforeEach(() => {
            _model1 = {};
            _model2 = {};
            _router.registerModel('modelId1', _model1);
            _router.registerModel('modelId2', _model2);
            _router.getEventObservable('modelId1', 'triggerExecuteEvent').observe(() => {
                _router.executeEvent('ExecutedEvent', {});
            });
        });

        it('should only allow execute during processor and event dispatch stages', () => {
            var model1 = { value: ""}, updateStreamTestRan = false;
            _router.registerModel(
                'myModel',
                model1,
                {
                    preEventProcessor: () => _router.executeEvent('ExecutedEvent', "a"),
                    postEventProcessor: () => _router.executeEvent('ExecutedEvent', "c")
                }
            );
            _router.getEventObservable('myModel', 'TriggerExecuteEvent').observe(()=> {
                _router.executeEvent('ExecutedEvent', "b");
            });
            _router.getEventObservable('myModel', 'ExecutedEvent').observe((model, event, eventContext) => {
                model.value += event;
            });
            _router.getModelObservable('myModel').observe(() => {
                updateStreamTestRan = true;
                expect(() => {
                    _router.executeEvent('ExecutedEvent', {});
                }).toThrow();
            });
            _router.publishEvent('myModel', 'TriggerExecuteEvent', 'theEvent');
            expect(model1.value).toEqual("abc");
            expect(updateStreamTestRan).toEqual(true);
        });

        it('should throw if an execute handler raises another event', () => {
            var didTest = false;
            _router.getEventObservable('modelId1', 'ExecutedEvent').observe(() => {
                didTest = true;
                expect(() => {
                    _router.publishEvent('modelId1', 'Event3', {});
                }).toThrow();
             });
            raiseStartEvent();
            expect(didTest).toEqual(true);
        });

        it('should execute the event against the current event loops model', () => {
            var actualModel;
            _router.getEventObservable('modelId1', 'ExecutedEvent').observe((model, event, eventContext) => {
                actualModel = model;
            });
            raiseStartEvent();
            expect(actualModel).toBeDefined();
            expect(actualModel).toBe(_model1);
        });

        it('should execute the event immediately', () => {
            var counter = 0, testPassed = false;
            _router.getEventObservable('modelId1', 'triggerExecuteEvent2').observe(() => {
                counter = 1;
                _router.executeEvent('ExecutedEvent', {});
                counter = 2;
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent').observe(() => {
                testPassed = counter === 1;
            });
            _router.publishEvent('modelId1', 'triggerExecuteEvent2', 'theEvent');
            testPassed = testPassed && counter === 2;
            expect(testPassed).toEqual(true);
        });

        it('should execute the event against all stages', () => {
            var previewReceived = false, normalReceived = false, committedReceived = false;
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'preview').observe(() => {
                previewReceived = true;
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'normal').observe((model, event, eventContext) => {
                normalReceived = true;
                eventContext.commit();
            });
            _router.getEventObservable('modelId1', 'ExecutedEvent', 'committed').observe(() => {
                committedReceived = true;
            });
            raiseStartEvent();
            expect(previewReceived).toEqual(true);
            expect(normalReceived).toEqual(true);
            expect(committedReceived).toEqual(true);
        });
    });

    describe('lock/unlock', () => {
        var _model,
            _modelWasLockedForChangeDispatch = false;

        beforeEach(() => {
            _model = {
                isLocked: true, // default state
                isUnlockedForPreEventProcessor: false,
                isUnlockedForEventProcessor: false,
                isUnlockedForPostEventProcessor: false,
                unlock() {
                    this.isLocked = false;
                },
                lock() {
                    this.isLocked = true;
                }
            };
            _modelWasLockedForChangeDispatch = false;
            _router.registerModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model, event, eventContext) => {
                        model.isUnlockedForPreEventProcessor = !model.isLocked;
                    },
                    postEventProcessor: (model, event, eventContext) => {
                        model.isUnlockedForPostEventProcessor = !model.isLocked;
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').observe((model, event) => {
                model.isUnlockedForEventProcessor = !model.isLocked;
            });
            _router.getModelObservable('modelId1').observe((model) => {
                _modelWasLockedForChangeDispatch = model.isLocked;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
        });

        it('should unlock the model for pre event processing', () => {
            expect(_model.isUnlockedForPreEventProcessor).toEqual(true);
        });

        it('should unlock the model for event processor processing', () => {
            expect(_model.isUnlockedForEventProcessor ).toEqual(true);
        });

        it('should unlock the model for post event processing', () => {
            expect(_model.isUnlockedForPostEventProcessor).toEqual(true);
        });

        it('should lock the model for change notification dispatch', () => {
            expect(_modelWasLockedForChangeDispatch).toEqual(true);
        });
    });

    describe('.getEventObservable()', () => {

        it('throws on observe if arguments incorrect', () => {
            expect(() => {_router.getEventObservable({}, 'foo').observe(()=>{}); }).toThrow(new Error('The modelId argument should be a string'));
            expect(() => {_router.getEventObservable(undefined, 'foo').observe(()=>{}); }).toThrow();
            expect(() => {_router.getEventObservable('foo', undefined).observe(()=>{}); }).toThrow();
        });

        it('throws on observe if unknown event stage passed', () => {
            expect(() => {_router.getEventObservable('foo', 'eventType', 'unknownStage').observe(()=>{}); }).toThrow(new Error('The stage argument value of [unknownStage] is incorrect. It should be preview, normal or committed.'));
            expect(() => {_router.getEventObservable('foo', 'eventType', {}).observe(()=>{}); }).toThrow(new Error('The stage argument should be a string'));
        });

        it('dispatches events to processors by modelid', () => {
            var model1ProcessorReceived = false, model2ProcessorReceived = false;
            _router.registerModel('modelId1', {});
            _router.registerModel('modelId2', {});
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                model1ProcessorReceived = true;
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                model2ProcessorReceived = true;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(model1ProcessorReceived).toBe(true);
            expect(model2ProcessorReceived).toBe(false);
        });

        it('doesn\'t dispatch to disposed update ubscribers', () => {
            _router.registerModel('modelId1', {});
            var eventReeivedCount =0;
            var disposable = _router.getEventObservable('modelId1', 'Event1').observe(() => {
                eventReeivedCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(eventReeivedCount).toBe(1);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(eventReeivedCount).toBe(1);
        });

        describe('subscription stages', () => {

            var receivedAtPreview,
                receivedAtNormal,
                receivedAtCommitted,
                eventContextActions;

            function publishEvent() {
                _router.publishEvent('modelId1', 'Event1', 'theEvent');
            }

            function actOnEventContext(eventContext, stage) {
                if(eventContextActions.shouldCancel && eventContextActions.cancelStage === stage) {
                    eventContext.cancel();
                }
                if(eventContextActions.shouldCommit && eventContextActions.commitStage === stage) {
                    eventContext.commit();
                }
            }

            beforeEach(() => {
                receivedAtPreview = false;
                receivedAtNormal = false;
                receivedAtCommitted = false;
                eventContextActions = {
                    shouldCommit: false,
                    cancelStage: '',
                    shouldCancel: false,
                    commitStage: ''
                };
                _router.registerModel('modelId1', {});
                _router.getEventObservable('modelId1', 'Event1', esp.EventStage.preview)
                    .observe((model, event, eventContext) => {
                        receivedAtPreview = true;
                        actOnEventContext(eventContext, esp.EventStage.preview);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.EventStage.normal)
                    .observe((model, event, eventContext) => {
                        receivedAtNormal = true;
                        actOnEventContext(eventContext, esp.EventStage.normal);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.EventStage.committed)
                    .observe((model, event, eventContext) => {
                        receivedAtCommitted = true;
                        actOnEventContext(eventContext, esp.EventStage.committed);
                    });
            });

            it('delivers events to preview observers', () => {
                publishEvent();
                expect(receivedAtPreview).toBe(true);
            });

            it('doesn\'t propagate events canceled at preview stage', () => {
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.EventStage.preview;
                publishEvent();
                expect(receivedAtPreview).toBe(true);
                expect(receivedAtNormal).toBe(false);
            });

            it('delivers events to normal observers', () => {
                publishEvent();
                expect(receivedAtNormal).toBe(true);
            });

            it('doesn\'t propagate uncommitted events to the committed stage ', () => {
                publishEvent();
                expect(receivedAtCommitted).toBe(false);
            });

            it('propagates committed events to the committed stage ', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.EventStage.normal;
                publishEvent();
                expect(receivedAtCommitted).toBe(true);
            });

            it('throws if event committed at the preview stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.EventStage.preview;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event canceled at the normal stage', () => {
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.EventStage.normal;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event canceled at the committed stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.EventStage.normal;
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.EventStage.committed;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event committed at the committed stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.EventStage.committed;
                _router.getEventObservable('modelId1', 'Event1')
                    .observe((model, event, eventContext) => {
                        eventContext.commit();
                    });
                expect(() => {
                    publishEvent();
                }).toThrow();
            });
        });
    });

    describe('.getModelObservable()', () => {

        beforeEach(() => {
            _router.registerModel('modelId1', {number:0});
            _router.registerModel('modelId2', {number:0});
        });

        it('throws if arguments incorrect', () => {
            expect(() => {_router.getModelObservable(undefined).observe(() =>{}); }).toThrow(new Error('The modelId should be a string'));
            expect(() => {_router.getModelObservable({}).observe(() =>{}); }).toThrow(new Error('The modelId should be a string'));
        });

        it('dispatches model updates to observers by modelid', () => {
            var model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable('modelId1', 'Event1').observe(() => { /*noop*/  });
            _router.getModelObservable('modelId1').observe(() => {
                model1UpdateCount++;
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => { /*noop*/  });
            _router.getModelObservable('modelId2').observe(model => {
                model2UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            _router.publishEvent('modelId2', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(1);
            expect(model2UpdateCount).toBe(1);
        });

        it('doesn\'t dispatch to disposed update observers', () => {
            var model1UpdateCount = 0;
            _router.getEventObservable('modelId1', 'Event1').observe(() => { /*noop*/  });
            var disposable = _router.getModelObservable('modelId1').observe(() => {
                model1UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(1);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(1);
        });

        it('purges all model event queues before dispatching updates', () => {
            var modelUpdateCount = 0, eventCount = 0;
            _router.getModelObservable('modelId1').observe(() => {
                modelUpdateCount++;
            });
            _router.getModelObservable('modelId2').observe(() => {
                modelUpdateCount++;
            });
            _router.getEventObservable('modelId1', 'StartEvent').observe(() => {
                _router.publishEvent('modelId1', 'Event1', 1);
                _router.publishEvent('modelId2', 'Event1', 2);
                _router.publishEvent('modelId1', 'Event1', 3);
                _router.publishEvent('modelId2', 'Event1', 4);
            });
            _router.getEventObservable('modelId1', 'Event1').observe(() => {
                eventCount++;
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => {
                eventCount++;
            });
            _router.publishEvent('modelId1', 'StartEvent', 'payload');
            expect(eventCount).toBe(4);
            expect(modelUpdateCount).toBe(2);
        });

        it('processes events published during model dispatch', () => {
            var event2Received = false;
            var publishedEvent2 = false;
            _router.getEventObservable('modelId1', 'Event1').observe(() => { /* noop */ });
            _router.getEventObservable('modelId1', 'Event2').observe(() => {
                event2Received = true;
            });
            _router.getModelObservable('modelId1').observe(() => {
                if(!publishedEvent2) {
                    publishedEvent2 = true;
                    _router.publishEvent('modelId1', 'Event2', 1);
                }
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(event2Received).toBe(true);
        });

        it('only dispatches changes for models whos processors received event', () => {
            var model1UpdateCount = 0, model2UpdateCount = 0;
            _router.getEventObservable('modelId2', 'StartEvent').observe(() => {
                _router.publishEvent('modelId2', 'Event1', 'payload');
            });
            _router.getEventObservable('modelId1', 'Event1').observe(() => { /*noop*/  });
            _router.getModelObservable('modelId1').observe(() => {
                model1UpdateCount++;
            });
            _router.getEventObservable('modelId2', 'Event1').observe(() => { /*noop*/  });
            _router.getModelObservable('modelId2').observe(() => {
                model2UpdateCount++;
            });
            _router.publishEvent('modelId2', 'StartEvent', 'payload');
            expect(model1UpdateCount).toBe(0);
            expect(model2UpdateCount).toBe(1);
        });

        it('should dispatch change to models if event if only one event was processed', () => {
        	// there is a condition whereby the first processors processes the event flagging the model as dirty,
            // but the second event doesn't get processed which un flags the prior event
            pending();
        });
    });

    describe('error conditions', function() {

        var _eventReceivedCount = 0;
        var _updateReceivedCount = 0;
        var _model;
        var _eventStreamErr;
        var _modelUpdateStreamErr;

        beforeEach(()=> {
            _eventReceivedCount =0;
            _updateReceivedCount =0;
            _model = {
                throwAtUpdate: false
            };
            _router.registerModel(
                'modelId1',
                _model,
                {
                    preEventProcessor: (model, event)  => {
                        if (event.throwAtPre) {
                            throw new Error("Boom:Pre");
                        }
                    },
                    postEventProcessor: (model, event) => {
                        if (event.throwAtPost) {
                            throw new Error("Boom:Post");
                        }
                    }
                }
            );
            _router.getEventObservable('modelId1', 'Event1').observe(
                (model, event) => {
                    _eventReceivedCount++;
                    if(event.throwADispatch) {
                        throw new Error("Boom:Dispatch");
                    }
                    if(event.throwAtUpdate) {
                        model.throwAtUpdate = true;
                    }
                },
                err => _eventStreamErr = err
            );
            _router.getModelObservable('modelId1').observe(
                model => {
                    _updateReceivedCount++;
                    if(model.throwAtUpdate) {
                        throw new Error("Boom:Update");
                    }
                },
                err => _modelUpdateStreamErr = err
            );
        });

        it('should halt and rethrow if a pre processor errors', () => {
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { throwAtPre: true });
            }).toThrow(new Error("Boom:Pre"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
        });

        it('should halt and rethrow if an event stream handler errors ', () => {
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { throwADispatch: true });
            }).toThrow(new Error("Boom:Dispatch"));
            expect(_eventStreamErr).toEqual(new Error("Boom:Dispatch"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Dispatch]"));
        });

        it('should halt and rethrow if a post processor errors', () => {
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { throwAtPost: true });
            }).toThrow(new Error("Boom:Post"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Post]"));
        });

        it('should halt and rethrow if an update stream handler errors', () => {
            // halt and rethrow
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', { throwAtUpdate: true });
            }).toThrow(new Error("Boom:Update"));
            expect(_modelUpdateStreamErr).toEqual(new Error("Boom:Update"));
            // rethrow on reuse
            expect(() => {
                _router.publishEvent('modelId1', 'Event1', 'payload');
            }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Update]"));
        });

        describe('when isHalted', () => {
            beforeEach(()=> {
                expect(() => {
                    _router.publishEvent('modelId1', 'Event1', { throwAtPre: true });
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

            it('should throw on registerModel()', () => {
                expect(() => {
                    _router.registerModel('modelId2', {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });

            it('should throw on getModelObservable()', () => {
                expect(() => {
                    _router.getModelObservable('modelId1').observe(() => {});
                }).toThrow(new Error("Event router halted due to previous error [Error: Boom:Pre]"));
            });
        });
    });

    describe('child models', () => {

        var _model, _otherModel, _rootOptionsHelper, _childOptionsHelper, _grandchildOptionsHelper;

        beforeEach(() => {
            _model = {
                id:"rootId",
                child: {
                    id:"childId",
                    grandchild: {
                        id:"grandchildId"
                    }
                }
            };
            _otherModel = { id : "otherModelId" };
            _rootOptionsHelper = createOptionsHelper();
            _childOptionsHelper = createOptionsHelper();
            _grandchildOptionsHelper = createOptionsHelper();
            _router.registerModel(_otherModel.id, _otherModel);
            _router.registerModel(_model.id, _model, _rootOptionsHelper.options);
            _router.addChildModel(_model.id, _model.child.id, _model.child, _childOptionsHelper.options);
            _router.addChildModel(_model.child.id, _model.child.grandchild.id, _model.child.grandchild, _grandchildOptionsHelper.options);
        });

        function createOptionsHelper() {
            var helper = {
                modelsSentForPreProcessing : [],
                modelsSentForPostProcessing : [],
                options : {
                    preEventProcessor: (model, event, eventContext) => {
                        helper.modelsSentForPreProcessing.push(model);
                    },
                    postEventProcessor: (model, event, eventContext) => {
                        helper.modelsSentForPostProcessing.push(model);
                    }
                }
            };
            return helper;
        }

        it('should throw if parentModelId undefined', function() {
            expect(() => {_router.addChildModel(undefined, undefined, undefined); }).toThrow(new Error('The parentModelId argument should be a string'));
        });
        it('should throw if childModelId undefined', function() {
            expect(() => {_router.addChildModel("id", undefined, undefined); }).toThrow(new Error('The childModelId argument should be a string'));
        });
        it('should throw if model undefined', () => {
            expect(() => {_router.addChildModel("id", "childID", undefined); }).toThrow(new Error('The model argument should be defined'));
        });
        it('should throw if parentModelId not registered', () => {
            expect(() => {_router.addChildModel("id", "childID", {}); }).toThrow(new Error('Parent model with id [id] is not registered'));
        });

        it('should deliver the child model and event to event observers', () => {
            var receivedModel, receivedEvent;
            _router.getEventObservable(_model.child.id, "fooEvent").observe((model, event) => {
                receivedModel = model;
                receivedEvent = event;
            });
            _router.publishEvent(_model.child.id, "fooEvent", 1);
            expect(receivedModel).toBeDefined();
            expect(receivedModel).toBe(_model.child);
            expect(receivedEvent).toBeDefined();
            expect(receivedEvent).toEqual(1);
        });

        it('should dispatch updates for the child model only', () => {
            var parentUpdateCount = 0, childUpdateCount = 0;
            _router.getEventObservable(_model.child.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getModelObservable(_model.id).observe(() => {
                parentUpdateCount++;
            });
            _router.getModelObservable(_model.child.id).observe(() => {
                childUpdateCount++;
            });
            _router.publishEvent(_model.child.id, "fooEvent", 1);
            expect(parentUpdateCount).toEqual(0);
            expect(childUpdateCount).toEqual(1);
        });

        it('should raise a model changed event to parent when child\'s event workflow done', () => {
            var receivedModel, receivedEvent, childsWorkflowDone;
            _router.getEventObservable(_model.child.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model.id, "modelChangedEvent").observe((model, event) => {
                receivedModel = model;
                receivedEvent = event;
                childsWorkflowDone = _childOptionsHelper.modelsSentForPostProcessing.length === 1;
            });
            _router.publishEvent(_model.child.id, "fooEvent", 1);
            expect(receivedModel).toBe(_model);
            expect(receivedEvent).toBeDefined();
            expect(receivedEvent.childModelId).toEqual(_model.child.id);
            expect(receivedEvent.eventType).toEqual("fooEvent");
            expect(childsWorkflowDone).toEqual(true);
        });

        it('should process parents modelChangedEvent before events for other models', () => {
            var testPassed = false, barEventReceived = false;
            _router.getEventObservable(_otherModel.id, "barEvent").observe((model, event) => {
                barEventReceived = true;
            });
            _router.getEventObservable(_model.child.id, "fooEvent").observe((model, event) => {
                // even though this 'barEvent' will get raised before the 'modelChangedEvent',
                // it should be processed after.
                _router.publishEvent(_otherModel.id, "barEvent", 1);
                testPassed =
                    _rootOptionsHelper.modelsSentForPreProcessing.length === 0 &&
                    _rootOptionsHelper.modelsSentForPostProcessing.length === 0 &&
                    _childOptionsHelper.modelsSentForPreProcessing.length === 1 &&
                    _childOptionsHelper.modelsSentForPostProcessing.length === 0;
            });
            _router.getEventObservable(_model.id, "modelChangedEvent").observe((model, event) => {
                testPassed =
                    testPassed &&
                    !barEventReceived &&
                    _rootOptionsHelper.modelsSentForPreProcessing.length === 1 &&
                    _rootOptionsHelper.modelsSentForPostProcessing.length === 0 &&
                    _childOptionsHelper.modelsSentForPreProcessing.length === 1 &&
                    _childOptionsHelper.modelsSentForPostProcessing.length === 1;
            });
            _router.publishEvent(_model.child.id, "fooEvent", 1);
            testPassed =
                testPassed &&
                barEventReceived &&
                _rootOptionsHelper.modelsSentForPreProcessing.length === 1 &&
                _rootOptionsHelper.modelsSentForPostProcessing.length === 1 &&
                _childOptionsHelper.modelsSentForPreProcessing.length === 1 &&
                _childOptionsHelper.modelsSentForPostProcessing.length === 1;
            expect(testPassed).toEqual(true);
        });

        it('should deliver parent model update before child models', () => {
            var updateOrders = [];
            _router.getModelObservable(_model.child.grandchild.id).observe(() => {
                updateOrders.push("grandchild");
            });
            _router.getModelObservable(_model.child.id).observe(() => {
                updateOrders.push("child");
            });
            _router.getModelObservable(_model.id).observe(() => {
                updateOrders.push("parent");
            });
            _router.getEventObservable(_model.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model.child.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model.child.grandchild.id, "fooEvent").observe((model, event) => { /* noop */});

            _router.getEventObservable(_model.id, "modelChangedEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model.child.id, "modelChangedEvent").observe((model, event) => { /* noop */});

            _router.publishEvent(_model.child.grandchild.id, "fooEvent", 1);
            expect(updateOrders).toEqual(["parent", "child", "grandchild"]);
        });

        describe('.removeChildModel', () => {
            it('should remove the child', () => {
               var model = {
                    id:"rootId1",
                    child: {
                        id:"childId"
                    }
                };
                _router.registerModel(model.id, model);
                _router.addChildModel(model.id, model.child.id, model.child);
                expect(_router._models[model.child.id]).toBeDefined();
                expect(_router._models[model.id].childrenIds.length).toEqual(1);
            });
 
            it('should remove all children when a parent is removed', () => {
                var rootCompleted = false, childCompleted = false, grandChildCompleted = false;
                _router.getModelObservable(_model.id).observe(
                    () => {                     },
                    ex => {},
                    () =>{
                        rootCompleted = true;
                    }
                );
                _router.getModelObservable(_model.child.id).observe(
                    () => {                     },
                    ex => {},
                    () =>{
                        childCompleted = true;
                    }
                );
                _router.getModelObservable(_model.child.grandchild.id).observe(
                    () => {                     },
                    ex => {},
                    () =>{
                        grandChildCompleted = true;
                    }
                );
                _router.removeModel(_model.id);
                expect(rootCompleted).toEqual(true);
                expect(childCompleted).toEqual(true);
                expect(grandChildCompleted).toEqual(true);
            });

            it('should remove reference to child from parent', ()=> {
                var model = { id:"rootId1"  };
                var child1 = { id :"1" };
                var child2 = { id :"2" };
                var child3 = { id :"3" };
                var child4 = { id :"4" };
                _router.registerModel(model.id, model);
                _router.addChildModel(model.id, child1.id, child1);
                _router.addChildModel(model.id, child2.id, child2);
                _router.addChildModel(model.id, child3.id, child3);
                _router.addChildModel(model.id, child4.id, child4);
                expect(_router._models[model.id].childrenIds).toEqual(["1","2","3","4"]);
                _router.removeModel(child3.id);
                expect(_router._models[model.id].childrenIds).toEqual(["1","2","4"]);
            });
        });
    });
});