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

    describe('.observeEventsOn with function naming conventions', () => {
        var previewInvokeCount = 0;
        var normalInvokeCount = 0;
        var normal2InvokeCount = 0;
        var committedInvokeCount = 0;
        var subscription;
        var _model = {
            // standard events
            _observe_fooEvent_preview(e, c, m) {
                previewInvokeCount++;
            },
            _observe_fooEvent_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _observe_fooEvent(e, c, m) {
                normal2InvokeCount++;
            },
            _observe_fooEvent_committed(e, c, m) {
                committedInvokeCount++;
            },
            // events with underscores
            _observe_bar_Event_preview(e, c, m) {
                previewInvokeCount++;
            },
            _observe_bar_Event_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _observe_bar_Event(e, c, m) {
                normal2InvokeCount++;
            },
            _observe_bar_Event_committed(e, c, m) {
                committedInvokeCount++;
            },
            // custom prefix
            _customPrefix_bar_Event_preview(e, c, m) {
                previewInvokeCount++;
            },
            _customPrefix_bar_Event_normal(e, c, m) {
                normalInvokeCount++;
                c.commit();
            },
            _customPrefix_bar_Event(e, c, m) {
                normal2InvokeCount++;
            },
            _customPrefix_bar_Event_committed(e, c, m) {
                committedInvokeCount++;
            }
        };

        beforeEach(() => {
            previewInvokeCount = 0;
            normalInvokeCount = 0;
            normal2InvokeCount = 0;
            committedInvokeCount = 0;
            _router.addModel('modelId', _model);
        });

        it('should observe events by event name and stage', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events with underscores in event name ', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'bar_Event', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events with custom prefix in event name ', ()=> {
            subscription = _router.observeEventsOn('modelId', _model, '_customPrefix_');
            _router.publishEvent('modelId', 'bar_Event', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should stop observing events when disposable disposed', ()=> {
            subscription = _router.observeEventsOn('modelId', _model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            _router.publishEvent('modelId', 'fooEvent', 1);
            subscription.dispose();
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(2);
            expect(normalInvokeCount).toBe(2);
            expect(normal2InvokeCount).toBe(2);
            expect(committedInvokeCount).toBe(2);
        });

        it('should observe events via prototype chain', ()=> {
            var model2 = Object.create(_model);
            subscription = _router.observeEventsOn('modelId', model2);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should observe events via ctor function', ()=> {
            var invokeCount = 0;
            class Model {
                _observe_fooEvent(m, e, c) {
                    invokeCount++;
                }
            }
            var model = new Model();
            subscription = _router.observeEventsOn('modelId', model);
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(invokeCount).toBe(1);
        });
    });

    describe('.observeEventsOn with decorators', () => {
        var previewInvokeCount = 0;
        var normalInvokeCount = 0;
        var normal2InvokeCount = 0;
        var committedInvokeCount = 0;
        var _model, _derivedModel1, _derivedModel2;

        class Model extends esp.DisposableBase {
            constructor(id, router) {
                super();
                this._id = id;
                this._router = router;
                this.receivedBarEvents = [];
            }
            observeEvents() {
                this.addDisposable(this._router.observeEventsOn(this._id, this));
            }
            //start-non-standard
            @esp.observeEvent('fooEvent', esp.ObservationStage.preview)
            _fooEventAtPreview(e, c, m) {
                previewInvokeCount++;
            }
            @esp.observeEvent('fooEvent', esp.ObservationStage.normal)
            _fooEventAtNormal1(e, c, m) {
                normalInvokeCount++;
                c.commit();
            }
            @esp.observeEvent('fooEvent')
            _fooEventAtNormal2(e, c, m) {
                normal2InvokeCount++;
            }
            @esp.observeEvent('fooEvent', esp.ObservationStage.committed)
            _fooEventAtCommitted(e, c, m) {
                committedInvokeCount++;
            }
            @esp.observeEvent('barEvent_1')
            _barEvent_1(e, c, m) {
                c.commit();
            }
            @esp.observeEvent('barEvent_1', esp.ObservationStage.committed)
            @esp.observeEvent('barEvent_2')
            @esp.observeEvent('barEvent_3', esp.ObservationStage.preview)
            _allBarEvents(e, c, m) {
                this.receivedBarEvents.push({event: e, stage: c.currentStage});
            }
            //end-non-standard
        }

        class BaseModel extends esp.DisposableBase {
            constructor(id, router) {
                super();
                this._id = id;
                this._router = router;
                this.baseEventReveivedCount = 0;
            }
            observeEvents() {
                this.addDisposable(this._router.observeEventsOn(this._id, this));
            }
            @esp.observeEvent('aBaseEvent')
            _aBaseEvent(e, c, m) {
                this.baseEventReveivedCount++;
            }
        }

        class DerivedModel1 extends BaseModel {
            constructor(id, router) {
                super(id, router);
                this.reveivedCount = 0;
            }
            @esp.observeEvent('derivedEvent')
            _derivedEvent(e, c, m) {
                this.reveivedCount++;
            }
            // override
            observeEvents() {
                this.addDisposable(this._router.observeEventsOn(this._id, this));
            }
        }

        class DerivedModel2 extends BaseModel {
            constructor(id, router) {
                super(id, router);
                this.reveivedCount = 0;
            }
            @esp.observeEvent('derivedEvent')
            _derivedEvent(e, c, m) {
                this.reveivedCount++;
            }
            // override
            observeEvents() {
                this.addDisposable(this._router.observeEventsOn(this._id, this));
            }
        }

        beforeEach(() => {
            previewInvokeCount = 0;
            normalInvokeCount = 0;
            normal2InvokeCount = 0;
            committedInvokeCount = 0;

            _model = new Model('modelId', _router);
            _router.addModel('modelId', _model);

            _derivedModel1 = new DerivedModel1('derivedModel1Id', _router);
            _router.addModel('derivedModel1Id', _derivedModel1);

            _derivedModel2 = new DerivedModel2('derivedModel2Id', _router);
            _router.addModel('derivedModel2Id', _derivedModel2);
        });

        it('should observe events by event name and stage', ()=> {
            _model.observeEvents();
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(1);
            expect(normalInvokeCount).toBe(1);
            expect(normal2InvokeCount).toBe(1);
            expect(committedInvokeCount).toBe(1);
        });

        it('should stop observing events when disposable disposed', ()=> {
            _model.observeEvents();
            _router.publishEvent('modelId', 'fooEvent', 1);
            _router.publishEvent('modelId', 'fooEvent', 1);
            _model.dispose();
            _router.publishEvent('modelId', 'fooEvent', 1);
            expect(previewInvokeCount).toBe(2);
            expect(normalInvokeCount).toBe(2);
            expect(normal2InvokeCount).toBe(2);
            expect(committedInvokeCount).toBe(2);
        });

        it('should observe multiple events', ()=> {
            _model.observeEvents();

            _router.publishEvent('modelId', 'barEvent_1', 1);
            expect(_model.receivedBarEvents.length).toBe(1);
            expect(_model.receivedBarEvents[0].event).toBe(1);
            expect(_model.receivedBarEvents[0].stage).toBe(esp.ObservationStage.committed);

            _router.publishEvent('modelId', 'barEvent_2', 2);
            expect(_model.receivedBarEvents.length).toBe(2);
            expect(_model.receivedBarEvents[1].event).toBe(2);
            expect(_model.receivedBarEvents[1].stage).toBe(esp.ObservationStage.normal);

            _router.publishEvent('modelId', 'barEvent_3', 3);
            expect(_model.receivedBarEvents.length).toBe(3);
            expect(_model.receivedBarEvents[2].event).toBe(3);
            expect(_model.receivedBarEvents[2].stage).toBe(esp.ObservationStage.preview);

            _model.dispose();
            _router.publishEvent('modelId', 'barEvent_1', 1);
            _router.publishEvent('modelId', 'barEvent_2', 1);
            _router.publishEvent('modelId', 'barEvent_3', 1);

            expect(_model.receivedBarEvents.length).toBe(3);
        });

        it('should only observe events in a derived objects inheritance hierarchy', ()=> {
            _derivedModel1.observeEvents();
            _router.publishEvent('derivedModel1Id', 'derivedEvent', {});
            expect(_derivedModel1.reveivedCount).toBe(1);
            _router.publishEvent('derivedModel1Id', 'aBaseEvent', {});
            expect(_derivedModel1.baseEventReveivedCount).toBe(1);

            _derivedModel2.observeEvents();
            _router.publishEvent('derivedModel2Id', 'derivedEvent', {});
            expect(_derivedModel1.reveivedCount).toBe(1);
            expect(_derivedModel2.reveivedCount).toBe(1);
            _router.publishEvent('derivedModel2Id', 'aBaseEvent', {});
            expect(_derivedModel1.baseEventReveivedCount).toBe(1);
            expect(_derivedModel2.baseEventReveivedCount).toBe(1);
        });
    });
});