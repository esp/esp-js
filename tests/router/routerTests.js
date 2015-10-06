// notice_start
/*
 * Copyright 2015 Keith Woods
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

    describe('.registerModel()', () => {
        it('throws if arguments incorrect', () => {
            expect(() => {_router.registerModel(undefined, 'foo'); }).toThrow();
            expect(() => {_router.registerModel('foo', undefined); }).toThrow();
            expect(() => {_router.registerModel('foo', {}, 'not a function'); }).toThrow();
            expect(() => {_router.registerModel({ },{ }); }).toThrow(new Error('The modelId argument should be a string'));
            expect(() => {_router.registerModel("modelId", { },"notSomeOptions"); }).toThrow(new Error('The options argument should be an object'));
            expect(() => {_router.registerModel("modelId", { }, { preEventProcessor: {} }); }).toThrow(new Error('preEventProcessor on the options parameter is neither a function nor an object with a process() method'));
            expect(() => {_router.registerModel("modelId", { }, { preEventProcessor: "boo" }); }).toThrow(new Error('preEventProcessor on the options parameter is neither a function nor an object with a process() method'));
            expect(() => {_router.registerModel("modelId", { }, { postEventProcessor:{}}); }).toThrow(new Error('postEventProcessor on the options parameter is neither a function nor an object with a process() method'));
            expect(() => {_router.registerModel("modelId", { }, { postEventProcessor:"boo"}); }).toThrow(new Error('postEventProcessor on the options parameter is neither a function nor an object with a process() method'));
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
            _model = {
                removeAtPre: false,
                removeAtUpdate: false,
                removeAtPost: false,
                removeAtDispatch: false
            };
            _router.registerModel(
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
            _router.getEventObservable('modelId1', 'Event1').observe((model, event) => {
                _eventReceivedCount1++;
                if(model.removeAtDispatch) {
                    _router.removeModel('modelId1');
                }
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
            // the model gets pumped on initial observe so reset these here
            _preProcessorReceivedCount = 0;
            _eventReceivedCount1 =0;
            _eventReceivedCount2 =0;
            _postProcessorReceivedCount  =0;
            _updateReceivedCount1 = 0;
            _updateReceivedCount2 = 0;
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
            var lastEventDelivered = false;
            _router.registerModel('modelId1', {});
            _router.getEventObservable('modelId1', 'startEvent').observe((model, event, eventContext) => {
                eventContext.commit();
                _router.publishEvent('modelId1', 'Event1', 'theEvent1');
                _router.publishEvent('modelId1', 'Event2', 'theEvent2');
                _router.publishEvent('modelId1', 'Event3', 'theEvent3');
            });
            _router.getEventObservable('modelId1', 'Event1').observe((model, event, eventContext) => {
                testPassed = eventContext.isCommitted === false;
                eventContext.commit();
            });
            _router.getEventObservable('modelId1', 'Event2').observe((model, event, eventContext) => {
                testPassed = testPassed && eventContext.isCommitted === false;
                eventContext.commit();
            });
            _router.getEventObservable('modelId1', 'Event3').observe((model, event, eventContext) => {
                testPassed = testPassed && eventContext.isCommitted === false;
                lastEventDelivered = true;
            });
            _router.publishEvent('modelId1', 'startEvent', 'theEvent');
            expect(testPassed).toBe(true);
            expect(lastEventDelivered).toBe(true);
        });

        it('should copy custom properties on eventContext.custom', () => {
            pending();
        });
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
            _router.registerModel(_model1.id, _model1);
            _router.registerModel(_model2.id, _model2);
            _router.getModelObservable(_model1.id).observe(() => {
                model1ReceivedCount++;
            });
            _router.getModelObservable(_model2.id).observe(() => {
                model2ReceivedCount++;
            });
            // reset these as observing the model above would have bumped them to 1
            model1ReceivedCount = 0;
            model2ReceivedCount = 0;
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

    describe('eventProcessors', () => {
        var _model1 = {},
            _model2 = {},
            _model3 = {},
            _model5 = {},
            _testPassed = false,
            _modelsSentForPreProcessing = [],
            _modelsSentForPostProcessing = [],
            _options = {
                preEventProcessor: (model) => {
                    _modelsSentForPreProcessing.push(model);
                },
                postEventProcessor: (model) => {
                    _modelsSentForPostProcessing.push(model);
                }
            };

        beforeEach(() => {
            _model1 = { id: 1 };
            _model2 = { id: 2 };
            _model3 = { id: 3};
            _model5 = {
                preProcessCount : 0,
                postProcessCount : 0,
                preProcess() {
                    this.preProcessCount++;
                },
                postProcess() {
                    this.postProcessCount++;
                }
            };
            _testPassed = false;
            _modelsSentForPreProcessing = [];
            _modelsSentForPostProcessing = [];

            _router.registerModel('modelId1', _model1, _options);
            _router.registerModel('modelId2', _model2, _options);
            _router.registerModel('modelId3', _model3, _options);
            _router.registerModel('modelId5', _model5);

            _router.getEventObservable('modelId1', 'startEvent').observe(() => {
                _router.publishEvent('modelId3', 'Event1', 'theEvent');
                _router.publishEvent('modelId2', 'Event1', 'theEvent');
                _router.publishEvent('modelId1', 'Event1', 'theEvent');
            });
            _router.getEventObservable('modelId5', 'startEvent').observe(() => {
               /* noop */
            });
        });

        it('calls preProcess() if the model has this method before processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.preProcessCount).toBe(1);
        });

        it('calls postProcess() if the model has this method before processing the first event', () => {
            _router.publishEvent('modelId5', 'startEvent', 'theEvent');
            expect(_model5.postProcessCount).toBe(1);
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
            _router.getEventObservable('modelId4', 'Event1').observe(() => {
                /* noop */
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
                    preEventProcessor : (model) => { model.version++; },
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
                    preEventProcessor: (model) => {
                        model.isUnlockedForPreEventProcessor = !model.isLocked;
                    },
                    postEventProcessor: (model) => {
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
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.preview)
                    .observe((model, event, eventContext) => {
                        receivedAtPreview = true;
                        actOnEventContext(eventContext, esp.ObservationStage.preview);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.normal)
                    .observe((model, event, eventContext) => {
                        receivedAtNormal = true;
                        actOnEventContext(eventContext, esp.ObservationStage.normal);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.committed)
                    .observe((model, event, eventContext) => {
                        receivedAtCommitted = true;
                        actOnEventContext(eventContext, esp.ObservationStage.committed);
                    });
            });

            it('delivers events to preview observers', () => {
                publishEvent();
                expect(receivedAtPreview).toBe(true);
            });

            it('doesn\'t propagate events canceled at preview stage', () => {
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.ObservationStage.preview;
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
                eventContextActions.commitStage = esp.ObservationStage.normal;
                publishEvent();
                expect(receivedAtCommitted).toBe(true);
            });

            it('throws if event committed at the preview stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.ObservationStage.preview;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event canceled at the normal stage', () => {
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.ObservationStage.normal;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event canceled at the committed stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.ObservationStage.normal;
                eventContextActions.shouldCancel = true;
                eventContextActions.cancelStage = esp.ObservationStage.committed;
                expect(() => {
                    publishEvent();
                }).toThrow();
            });

            it('throws if event committed at the committed stage', () => {
                eventContextActions.shouldCommit = true;
                eventContextActions.commitStage = esp.ObservationStage.committed;
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
            expect(model1UpdateCount).toBe(2);
            expect(model2UpdateCount).toBe(2);
        });

        it('doesn\'t dispatch to disposed update observers', () => {
            var model1UpdateCount = 0;
            _router.getEventObservable('modelId1', 'Event1').observe(() => { /*noop*/  });
            var disposable = _router.getModelObservable('modelId1').observe(() => {
                model1UpdateCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'payload');
            expect(model1UpdateCount).toBe(2);
        });

        it('purges all model event queues before dispatching updates', () => {
            var modelUpdateCount = 0, eventCount = 0;
            _router.getModelObservable('modelId1').observe(() => {
                modelUpdateCount++;
            });
            _router.getModelObservable('modelId2').observe(() => {
                modelUpdateCount++;
            });
            expect(modelUpdateCount).toBe(2);
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
            expect(modelUpdateCount).toBe(4);
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
            expect(model1UpdateCount).toBe(1);
            _router.getEventObservable('modelId2', 'Event1').observe(() => { /*noop*/  });
            _router.getModelObservable('modelId2').observe(() => {
                model2UpdateCount++;
            });
            expect(model2UpdateCount).toBe(1);
            _router.publishEvent('modelId2', 'StartEvent', 'payload');
            expect(model1UpdateCount).toBe(1);
            expect(model2UpdateCount).toBe(2);
        });

        it('should dispatch change to models if event if only one event was processed', () => {
        	// there is a condition whereby the first processors processes the event flagging the model as dirty,
            // but the second event doesn't get processed which un flags the prior event
            pending();
        });

        it('should pump the last model on initial observation', () => {
            var model1UpdateCount = 0;
            _router.getModelObservable('modelId1').observe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toBe(1);
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
                throwAtPre: false,
                throwAtUpdate: false,
                throwAtPost: false,
                throwADispatch: false
            };
            _router.registerModel(
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
                (model, event) => {
                    _eventReceivedCount++;
                    if(model.throwADispatch) {
                        throw new Error("Boom:Dispatch");
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
            expect(_eventStreamErr).toEqual(new Error("Boom:Dispatch"));
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
            expect(_modelUpdateStreamErr).toEqual(new Error("Boom:Update"));
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

    describe('multiple models', () => {

        var _model, _model2, _model1OptionsHelper, _model2OptionsHelper;

        beforeEach(() => {
            _model = { id: "model1"  };
            _model2 = { id : " model2" };
            _model1OptionsHelper = createOptionsHelper();
            _model2OptionsHelper = createOptionsHelper();
            _router.registerModel(_model.id, _model, _model1OptionsHelper.options);
            _router.registerModel(_model2.id, _model2, _model2OptionsHelper.options);
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
            _router.getEventObservable(_model.id, "fooEvent").observe((model, event) => {
                model1ReceivedEvent = true;
            });
            _router.getEventObservable(_model2.id, "fooEvent").observe((model, event) => {
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
            _router.getEventObservable(_model.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model2.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getModelObservable(_model.id).observe(() => {
                model1UpdateCount++;
            });
            expect(model1UpdateCount).toEqual(1);
            _router.getModelObservable(_model2.id).observe(() => {
                model2UpdateCount++;
            });
            expect(model2UpdateCount).toEqual(1);
            _router.publishEvent(_model2.id, "fooEvent", 1);
            expect(model1UpdateCount).toEqual(1);
            expect(model2UpdateCount).toEqual(2);
        });

        it('should raise a model changed when child\'s event workflow done', () => {
            var receivedModel, receivedEvent, workflowDone;
            _router.getEventObservable(_model.id, "fooEvent").observe((model, event) => { /* noop */});
            _router.getEventObservable(_model2.id, "modelChangedEvent").observe((model, event) => {
                receivedModel = model;
                receivedEvent = event;
                workflowDone = _model1OptionsHelper.modelsSentForPostProcessing.length === 1;
            });
            _router.publishEvent(_model.id, "fooEvent", 1);
            expect(receivedModel).toBe(_model2);
            expect(receivedEvent).toBeDefined();
            expect(receivedEvent.modelId).toBe(_model.id);
            expect(workflowDone).toEqual(true);
        });
    });

    describe('.createModelRouter()', () => {
        var _model, _modelRouter, _dispatchedModelNumbers;

        beforeEach(() => {
            _model = {
                id:'theModel',
                aNumber:0,
                anotherNumber:0,
                executePassed: false
            };
            _dispatchedModelNumbers = [];
            _router.registerModel(_model.id, _model);
            _modelRouter = _router.createModelRouter(_model.id);
            _modelRouter.getEventObservable('fooEvent').observe((m,e) => {
                m.aNumber = e;
            });
            _modelRouter.getModelObservable().observe(m => {
                _dispatchedModelNumbers.push(m.aNumber);
            });
            _modelRouter.publishEvent('fooEvent', 1);
        });

        it('should proxy publishEvent and getEventObservable', ()=> {
            expect(_model.aNumber).toEqual(1);
        });

        it('should proxy executeEvent to correct model event processor', ()=> {
            _modelRouter.getEventObservable('barEvent').observe((m,e) => {
                m.executePassed = m.anotherNumber === 0;
            });
            _modelRouter.getEventObservable('fooEvent2').observe((m,e) => {
                _modelRouter.executeEvent('barEvent', 'theBar');
                m.anotherNumber = 1;
            });
            _modelRouter.publishEvent('fooEvent2', {});
            expect(_model.executePassed).toEqual(true);
        });

        it('should proxy getModelObservable to correct models change stream', ()=> {
            expect(_dispatchedModelNumbers.length).toEqual(2);
            expect(_dispatchedModelNumbers[0]).toEqual(0);
            expect(_dispatchedModelNumbers[1]).toEqual(1);
        });
    });

    describe('single model router', () => {
        var _model, _modelRouter, _dispatchedModelNumbers, _fooEventReceivedCount;

        beforeEach(() => {
            _model = {
                id:'theModel',
                aNumber:0,
                anotherNumber:0,
                executePassed: false,
                _observe_fooEvent(m, e, c) {
                    _fooEventReceivedCount++;
                },
            };
            _fooEventReceivedCount = 0;
            _modelRouter = new esp.SingleModelRouter();
            _modelRouter.setModel(_model);
            _dispatchedModelNumbers = [];
            _modelRouter.getEventObservable('fooEvent').observe((m,e) => {
                m.aNumber = e;
            });
            _modelRouter.getModelObservable().observe(m => {
                _dispatchedModelNumbers.push(m.aNumber);
            });
            _modelRouter.publishEvent('fooEvent', 1);
        });

        it('should throw if arguments incorrect', ()=> {
            expect(() => {
                new esp.SingleModelRouter({}, {}, {});
            }).toThrow(new Error('Incorrect usage. SingleModelRouter can take either: no params (in which case you need to call .setModel()), or an existing router and existing modelid.'));
        });

        it('should throw if arguments incorrect', ()=> {
            expect(() => {
                new esp.SingleModelRouter({});
            }).toThrow(new Error('Incorrect usage. SingleModelRouter can take either: no params (in which case you need to call .setModel()), or an existing router and existing modelid.'));
        });

        it('should throw if arguments incorrect', ()=> {
            expect(() => {
                new esp.SingleModelRouter({}, '');
            }).toThrow(new Error('Incorrect usage. SingleModelRouter can take either: no params (in which case you need to call .setModel()), or an existing router and existing modelid.'));
        });

        it('should proxy publishEvent and getEventObservable', ()=> {
            expect(_model.aNumber).toEqual(1);
        });

        it('should proxy executeEvent to correct model event processor', ()=> {
            _modelRouter.getEventObservable('barEvent').observe((m,e) => {
                m.executePassed = m.anotherNumber === 0;
            });
            _modelRouter.getEventObservable('fooEvent2').observe((m,e) => {
                _modelRouter.executeEvent('barEvent', 'theBar');
                m.anotherNumber = 1;
            });
            _modelRouter.publishEvent('fooEvent2', {});
            expect(_model.executePassed).toEqual(true);
        });

        it('should proxy getModelObservable to correct models change stream', ()=> {
            expect(_dispatchedModelNumbers.length).toEqual(2);
            expect(_dispatchedModelNumbers[0]).toEqual(0);
            expect(_dispatchedModelNumbers[1]).toEqual(1);
        });

        // not running these as the functionality doesn't work well with Es6 classes.
        // the issues is ES6 functions are not enumerable so you can't eaisly reflect
        // over the names. Need to do something with directives.
        //it('should proxy observeEventsOn', ()=> {
        //    _modelRouter.observeEventsOn(_model);
        //    _modelRouter.publishEvent('fooEvent', {});
        //    expect(_fooEventReceivedCount).toEqual(1);
        //});
    });

    // not running these as the functionality doesn't work well with Es6 classes.
    // the issues is ES6 functions are not enumerable so you can't eaisly reflect
    // over the names. Need to do something with directives.
    //describe('.observeEventsOn()', () => {
    //    var previewInvokeCount = 0;
    //    var normalInvokeCount = 0;
    //    var normal2InvokeCount = 0;
    //    var committedInvokeCount = 0;
    //    var _model;
    //    var subscription;
    //
    //    beforeEach(() => {
    //        previewInvokeCount = 0;
    //        normalInvokeCount = 0;
    //        normal2InvokeCount = 0;
    //        committedInvokeCount = 0;
    //        _model = {
    //            // standard evnets
    //            _observe_fooEvent_preview(m, e, c) {
    //                previewInvokeCount++;
    //            },
    //            _observe_fooEvent_normal(m, e, c) {
    //                normalInvokeCount++;
    //                c.commit();
    //            },
    //            _observe_fooEvent(m, e, c) {
    //                normal2InvokeCount++;
    //            },
    //            _observe_fooEvent_committed(m, e, c) {
    //                committedInvokeCount++;
    //            },
    //            // events with underscores
    //            _observe_bar_Event_preview(m, e, c) {
    //                previewInvokeCount++;
    //            },
    //            _observe_bar_Event_normal(m, e, c) {
    //                normalInvokeCount++;
    //                c.commit();
    //            },
    //            _observe_bar_Event(m, e, c) {
    //                normal2InvokeCount++;
    //            },
    //            _observe_bar_Event_committed(m, e, c) {
    //                committedInvokeCount++;
    //            },
    //            // custom prefix
    //            _customPrefix_bar_Event_preview(m, e, c) {
    //                previewInvokeCount++;
    //            },
    //            _customPrefix_bar_Event_normal(m, e, c) {
    //                normalInvokeCount++;
    //                c.commit();
    //            },
    //            _customPrefix_bar_Event(m, e, c) {
    //                normal2InvokeCount++;
    //            },
    //            _customPrefix_bar_Event_committed(m, e, c) {
    //                committedInvokeCount++;
    //            }
    //        };
    //        _router.registerModel('modelId', _model);
    //    });
    //
    //    it('should observe events event name and stage', ()=> {
    //        subscription = _router.observeEventsOn('modelId', _model);
    //        _router.publishEvent('modelId', 'fooEvent', 1);
    //        expect(previewInvokeCount).toBe(1);
    //        expect(normalInvokeCount).toBe(1);
    //        expect(normal2InvokeCount).toBe(1);
    //        expect(committedInvokeCount).toBe(1);
    //    });
    //
    //    it('should observe events with underscores in event name ', ()=> {
    //        subscription = _router.observeEventsOn('modelId', _model);
    //        _router.publishEvent('modelId', 'bar_Event', 1);
    //        expect(previewInvokeCount).toBe(1);
    //        expect(normalInvokeCount).toBe(1);
    //        expect(normal2InvokeCount).toBe(1);
    //        expect(committedInvokeCount).toBe(1);
    //    });
    //
    //    it('should observe events with custom prefix in event name ', ()=> {
    //        subscription = _router.observeEventsOn('modelId', _model, '_customPrefix_');
    //        _router.publishEvent('modelId', 'bar_Event', 1);
    //        expect(previewInvokeCount).toBe(1);
    //        expect(normalInvokeCount).toBe(1);
    //        expect(normal2InvokeCount).toBe(1);
    //        expect(committedInvokeCount).toBe(1);
    //    });
    //
    //    it('should stop observing events when disposable disposed', ()=> {
    //        subscription = _router.observeEventsOn('modelId', _model);
    //        _router.publishEvent('modelId', 'fooEvent', 1);
    //        _router.publishEvent('modelId', 'fooEvent', 1);
    //        subscription.dispose();
    //        _router.publishEvent('modelId', 'fooEvent', 1);
    //        expect(previewInvokeCount).toBe(2);
    //        expect(normalInvokeCount).toBe(2);
    //        expect(normal2InvokeCount).toBe(2);
    //        expect(committedInvokeCount).toBe(2);
    //    });
    //
    //    it('should observe events via prototype chain', ()=> {
    //        var model2 = Object.create(_model);
    //        subscription = _router.observeEventsOn('modelId', model2);
    //        _router.publishEvent('modelId', 'fooEvent', 1);
    //        expect(previewInvokeCount).toBe(1);
    //        expect(normalInvokeCount).toBe(1);
    //        expect(normal2InvokeCount).toBe(1);
    //        expect(committedInvokeCount).toBe(1);
    //    });
    //
    //    // this won't work with ES6 methods as they're not enumerable!!. Will perhaps need to use directives
    //    //it('should observe events via ctor function', ()=> {
    //    //    var invokeCount = 0;
    //    //    class Model {
    //    //        _observe_fooEvent(m, e, c) {
    //    //            invokeCount++;
    //    //        }
    //    //    }
    //    //    var model = new Model();
    //    //    subscription = _router.observeEventsOn('modelId', model);
    //    //    _router.publishEvent('modelId', 'fooEvent', 1);
    //    //    expect(invokeCount).toBe(1);
    //    //});
    //});
});