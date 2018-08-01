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

describe('Router', () => {

    let _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('.getEventObservable()', () => {

        it('throws on subscribe if arguments incorrect', () => {
            expect(() => {_router.getEventObservable({}, 'foo').subscribe(()=>{}); }).toThrow(new Error('The modelId argument should be a string'));
            expect(() => {_router.getEventObservable(undefined, 'foo').subscribe(()=>{}); }).toThrow();
            expect(() => {_router.getEventObservable('foo', undefined).subscribe(()=>{}); }).toThrow();
        });

        it('throws on subscribe if unknown event stage passed', () => {
            expect(() => {_router.getEventObservable('foo', 'eventType', 'unknownStage').subscribe(()=>{}); }).toThrow(new Error('The stage argument value of [unknownStage] is incorrect. It should be preview, normal or committed.'));
            expect(() => {_router.getEventObservable('foo', 'eventType', {}).subscribe(()=>{}); }).toThrow(new Error('The stage argument should be a string'));
        });

        it('dispatches events to processors by modelid', () => {
            let model1ProcessorReceived = false, model2ProcessorReceived = false;
            _router.addModel('modelId1', {});
            _router.addModel('modelId2', {});
            _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                model1ProcessorReceived = true;
            });
            _router.getEventObservable('modelId2', 'Event1').subscribe(() => {
                model2ProcessorReceived = true;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(model1ProcessorReceived).toBe(true);
            expect(model2ProcessorReceived).toBe(false);
        });

        it('doesn\'t dispatch to disposed update ubscribers', () => {
            _router.addModel('modelId1', {});
            let eventReeivedCount =0;
            let disposable = _router.getEventObservable('modelId1', 'Event1').subscribe(() => {
                eventReeivedCount++;
            });
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(eventReeivedCount).toBe(1);
            disposable.dispose();
            _router.publishEvent('modelId1', 'Event1', 'theEvent');
            expect(eventReeivedCount).toBe(1);
        });

        describe('subscription stages', () => {

            let receivedAtPreview,
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
                _router.addModel('modelId1', {});
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.preview)
                    .subscribe(({event, context}) => {
                        receivedAtPreview = true;
                        actOnEventContext(context, esp.ObservationStage.preview);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.normal)
                    .subscribe(({event, context}) => {
                        receivedAtNormal = true;
                        actOnEventContext(context, esp.ObservationStage.normal);
                    });
                _router.getEventObservable('modelId1', 'Event1', esp.ObservationStage.committed)
                    .subscribe(({event, context}) => {
                        receivedAtCommitted = true;
                        actOnEventContext(context, esp.ObservationStage.committed);
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
                    .subscribe((event, eventContext, model) => {
                        eventContext.commit();
                    });
                expect(() => {
                    publishEvent();
                }).toThrow();
            });
        });
    });
});