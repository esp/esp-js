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

describe('Router.observeEventsOn with decorators', () => {

    var _router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    var previewInvokeCount = 0;
    var normalInvokeCount = 0;
    var normal2InvokeCount = 0;
    var committedInvokeCount = 0;
    var _model, _derivedModel1, _derivedModel2, _derivedModel3, _derivedModel4, _derivedModel5;

    class Model extends esp.DisposableBase {
        constructor(id, router) {
            super();
            this._id = id;
            this._router = router;
            this.receivedBarEvents = [];
            this.receivedFruitEvents = [];
            this.subModel = new SubModel(id, router);
        }

        observeEvents() {
            this.addDisposable(this._router.observeEventsOn(this._id, this));
            this.subModel.observeEvents();
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

        @esp.observeEvent('fruitEvent', (m, e) => e.type === 'orange')
        _onFruitEvent(e, c, m) {
            this.receivedFruitEvents.push(e);
        }

        //end-non-standard
    }

    class SubModel extends esp.DisposableBase {
        constructor(id, router) {
            super();
            this._id = id;
            this._router = router;
            this.carEvents = [];
            this.tag = 'submodel';
        }

        observeEvents() {
            this.addDisposable(this._router.observeEventsOn(this._id, this));
        }

        @esp.observeEvent('carEvent', (m, e) => {
            return e.type === 'bmw' && m.tag === 'submodel';
        })
        _onFruitEvent(e, c, m) {
            this.carEvents.push({type: e.type, model: m});
        }
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

    class DerivedModel3 extends BaseModel {
        constructor(id, router) {
            super(id, router);
            this.reveivedCount = 0;
        }

        @esp.observeEvent('derivedEvent')
        _derivedEvent(e, c, m) {
            this.reveivedCount++;
        }

        // don't override the base observeEvents
    }

    class DerivedModel4 extends BaseModel {
        constructor(id, router) {
            super(id, router);
            this.reveivedCount = 0;
        }

        @esp.observeEvent('derivedEvent')
        _derivedEvent(e, c, m) {
            this.reveivedCount++;
        }

        // don't override the base observeEvents
    }

    class DerivedModel5 extends BaseModel {
        constructor(id, router) {
            super(id, router);
        }

        // has no declared events itself
    }

    class DerivedModel3_1 extends DerivedModel3 {
        constructor(id, router) {
            super(id, router);
            this.reveivedCount1 = 0;
        }

        @esp.observeEvent('derivedEvent_1')
        _derivedEvent_1(e, c, m) {
            this.reveivedCount1++;
        }
    }

    class DerivedModel4_1 extends DerivedModel4 {
        constructor(id, router) {
            super(id, router);
            this.reveivedCount1 = 0;
        }

        @esp.observeEvent('derivedEvent_1')
        _derivedEvent_1(e, c, m) {
            this.reveivedCount1++;
        }
    }


    function getExpectedObserveEventsOnTwiceError(modelId) {
        return new Error(`observeEventsOn has already been called for model with id '${modelId}' and the given object. Note you can observe the same model with different decorated objects, however you have called observeEventsOn twice with the same object.`);
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

        _derivedModel3 = new DerivedModel3_1('derivedModel3Id', _router);
        _router.addModel('derivedModel3Id', _derivedModel3);

        _derivedModel4 = new DerivedModel4_1('derivedModel4Id', _router);
        _router.addModel('derivedModel4Id', _derivedModel4);

        _derivedModel5 = new DerivedModel5('derivedModel5Id', _router);
        _router.addModel('derivedModel5Id', _derivedModel5);
    });

    it('should throw if event name is omitted', () => {
        expect(() => {
            class Foo {
                @esp.observeEvent()
                _anObserveFunction() {
                }
            }
        }).toThrow(new Error('eventName passed to an observeEvent decorator must be a string'));
        expect(() => {
            class Foo {
                @esp.observeEvent(null)
                _anObserveFunction() {
                }
            }
        }).toThrow(new Error('eventName passed to an observeEvent decorator must be a string'));
        expect(() => {
            class Foo {
                @esp.observeEvent(undefined)
                _anObserveFunction() {
                }
            }
        }).toThrow(new Error('eventName passed to an observeEvent decorator must be a string'));
    });

    it('should throw if event name is empty', () => {
        expect(() => {
            class Foo {
                @esp.observeEvent('')
                _anObserveFunction() {
                }
            }
        }).toThrow(new Error('eventName passed to an observeEvent decorator must not be \'\''));
    });

    it('should throw if event name is an invalid type', () => {
        expect(() => {
            class Foo {
                @esp.observeEvent({})
                _anObserveFunction() {
                }
            }
        }).toThrow(new Error('eventName passed to an observeEvent decorator must be a string'));
    });

    it('should observe events by event name and stage', () => {
        _model.observeEvents();
        _router.publishEvent('modelId', 'fooEvent', 1);
        expect(previewInvokeCount).toBe(1);
        expect(normalInvokeCount).toBe(1);
        expect(normal2InvokeCount).toBe(1);
        expect(committedInvokeCount).toBe(1);
    });

    it('should stop observing events when disposable disposed', () => {
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

    it('should observe multiple events', () => {
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

    it('should observe base events', () => {
        _derivedModel1.observeEvents();
        _router.publishEvent('derivedModel1Id', 'aBaseEvent', {});
        expect(_derivedModel1.baseEventReveivedCount).toBe(1);
    });

    it('should only observe events in a derived objects inheritance hierarchy', () => {
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

    it('should only observe events in a derived objects inheritance hierarchy when observeEvents is called on base model', () => {
        _derivedModel3.observeEvents();
        _derivedModel4.observeEvents();

        _router.publishEvent('derivedModel4Id', 'derivedEvent_1', {});
        expect(_derivedModel3.reveivedCount1).toBe(0);
        expect(_derivedModel4.reveivedCount1).toBe(1);
    });

    it('should only observe in a derived objects which has no event observations itself', () => {
        _derivedModel5.observeEvents();
        _router.publishEvent('derivedModel5Id', 'aBaseEvent', {});
        expect(_derivedModel5.baseEventReveivedCount).toBe(1);
    });

    it('should throw when observeEvents called twice with the same object', () => {
        _derivedModel1.observeEvents();
        expect(() => {
            _derivedModel1.observeEvents();
        }).toThrow(getExpectedObserveEventsOnTwiceError('derivedModel1Id'));
    });

    it('should use observeEvent predicate if provided', () => {
        _model.observeEvents();
        _router.publishEvent('modelId', 'fruitEvent', {type: 'apple'});
        expect(_model.receivedFruitEvents.length).toEqual(0);
        _router.publishEvent('modelId', 'fruitEvent', {type: 'orange'});
        expect(_model.receivedFruitEvents.length).toEqual(1);
        expect(_model.receivedFruitEvents[0].type).toEqual('orange');
    });

    it('should pass sub model to observeEvent predicate if provided', () => {
        _model.observeEvents();
        _router.publishEvent('modelId', 'carEvent', {type: 'vw'});
        expect(_model.subModel.carEvents.length).toEqual(0);
        _router.publishEvent('modelId', 'carEvent', {type: 'bmw'});
        expect(_model.subModel.carEvents.length).toEqual(1);
        expect(_model.subModel.carEvents[0].type).toEqual('bmw');
    });

    it('should allow multiple registrations for the same modelId against different objects', () => {
        _router.addModel('m1', {});
        class e {
            @esp.observeEvent('anEvent')
            _derivedEvent(e, c, m) {
            }
        }
        let eventObserver1 = new e();
        let eventObserver2 = new e();
        _router.observeEventsOn('m1', eventObserver1);
        expect(() => {
            _router.observeEventsOn('m1', eventObserver1);
        }).toThrow(getExpectedObserveEventsOnTwiceError('m1'));
        _router.observeEventsOn('m1', eventObserver2);
        expect(() => {
            _router.observeEventsOn('m1', eventObserver2);
        }).toThrow(getExpectedObserveEventsOnTwiceError('m1'));
    });

    it('should not throw when observeEvents called after initial observation disposed', () => {
        var subscription = _router.observeEventsOn('derivedModel1Id', _derivedModel1);
        subscription.dispose();
        subscription = _router.observeEventsOn('derivedModel1Id', _derivedModel1);
        _router.publishEvent('derivedModel1Id', 'aBaseEvent', {});
        expect(_derivedModel1.baseEventReveivedCount).toBe(1);
        subscription.dispose();
        _router.publishEvent('derivedModel1Id', 'aBaseEvent', {});
        expect(_derivedModel1.baseEventReveivedCount).toBe(1);
    });
});
