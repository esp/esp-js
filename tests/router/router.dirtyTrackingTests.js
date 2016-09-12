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

    @esp.dirtyTracking()
    class Entity {
        constructor(modelId, router) {
            this.modelId = modelId;
            this._router = router;
            this.events = [];
            this.subEntity = new SubEntity(modelId, router);
            this.subEntityWithExistingIsDirtyProp = new SubEntityWithExistingGetSetIsDirtyProp(modelId, router);
        }

        observeEvents() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
            this.subEntity.observeEvents();
            this.subEntityWithExistingIsDirtyProp.observeEvents();
        }

        @esp.observeEvent('anEvent')
        _onAnEvent(e, c, m) {
            this.events.push(e);
        }
    }

    @esp.dirtyTracking('customIsDirtyProperty')
    class SubEntity {
        constructor(modelId, router) {
            this.modelId = modelId;
            this._router = router;
            this.events = [];
        }

        observeEvents() {
            this._router.observeEventsOn(this.modelId, this);
        }

        @esp.observeEvent('aSubEvent')
        _onASubEvent(e, c, m) {
            this.events.push(e);
        }
    }

    @esp.dirtyTracking()
    class SubEntityWithExistingGetSetIsDirtyProp {
        constructor(modelId, router) {
            this.modelId = modelId;
            this._router = router;
            this.events = [];
            this._isDirty = false;
        }

        get isDirty() {
            return this._isDirty;
        }

        set isDirty(value) {
            this._isDirty = value;
        }

        observeEvents() {
            this._router.observeEventsOn(this.modelId, this);
        }

        @esp.observeEvent('aSubEvent2')
        _onASubEvent(e, c, m) {
            this.events.push(e);
        }
    }

    @esp.dirtyTracking()
    class BaseEntity {

    }

    class DerivedEntity extends BaseEntity {
        constructor(modelId, router) {
            super();
            this.modelId = modelId;
            this._router = router;
            this.events = [];
        }

        observeEvents() {
            this._router.addModel(this.modelId, this);
            this._router.observeEventsOn(this.modelId, this);
        }

        @esp.observeEvent('aDerivedEntityEvent')
        _onDerivedEntityEvent(e, c, m) {
            this.events.push(e);
        }
    }

    describe('Dirty Tracking', function () {

        var _router,
            _entity,
            _entityWasDirty,
            _subEntityWasDirty,
            _subEntityWithExistingGetSetIsDirtyPropWasDirty,
            _derivedEntity,
            _derivedEntityWasDirty;

        beforeEach(() => {
            _router = new esp.Router();
            _entity = new Entity('entityId', _router);
            _entity.observeEvents();
            _derivedEntity = new DerivedEntity('derivedEntityId', _router);
            _derivedEntity.observeEvents();
            _entityWasDirty = false;
            _subEntityWasDirty = false;
            _subEntityWithExistingGetSetIsDirtyPropWasDirty = false;
            _derivedEntityWasDirty = false;
            _router.getModelObservable('entityId').subscribe(model => {
                _entityWasDirty = model.isDirty || false;
                _subEntityWasDirty = model.subEntity.customIsDirtyProperty || false;
                _subEntityWithExistingGetSetIsDirtyPropWasDirty = model.subEntityWithExistingIsDirtyProp.isDirty;
            });
            _router.getModelObservable('derivedEntityId').subscribe(model => {
                _derivedEntityWasDirty = model.isDirty;
            });
        });

        it('should flag entity as dirty if it receives an event', () => {
            _router.publishEvent('entityId', 'anEvent', {});
            expect(_entityWasDirty).toEqual(true);
        });

        it('should reset flag after model dispatch', () => {
            _router.publishEvent('entityId', 'anEvent', {});
            expect(_entity.isDirty).toEqual(false);
        });

        it('should flag entities each time', () => {
            _router.publishEvent('entityId', 'anEvent', {});
            expect(_entityWasDirty).toEqual(true);
            expect(_entity.isDirty).toEqual(false);
            _entityWasDirty = false;

            _router.publishEvent('entityId', 'anEvent', {});
            expect(_entityWasDirty).toEqual(true);
            expect(_entity.isDirty).toEqual(false);
            _entityWasDirty = false;
        });

        it('should flag a sub entity as dirty if it receives an event', () => {
            _router.publishEvent('entityId', 'aSubEvent', {});
            expect(_subEntityWasDirty).toEqual(true);
        });

        it('should reset sub entity flag after model dispatch', () => {
            _router.publishEvent('entityId', 'aSubEvent', {});
            expect(_entity.subEntity.customIsDirtyProperty).toEqual(false);
        });

        it('should only flag the entity that was changed', () => {
            _router.publishEvent('entityId', 'anEvent', {});
            expect(_entityWasDirty).toEqual(true);
            expect(_subEntityWasDirty).toEqual(false);
            _entityWasDirty = false;

            _router.publishEvent('entityId', 'aSubEvent', {});
            expect(_entityWasDirty).toEqual(false);
            expect(_subEntityWasDirty).toEqual(true);
            _subEntityWasDirty = false;

            expect(_entity.isDirty).toEqual(false);
            expect(_entity.subEntity.customIsDirtyProperty).toEqual(false);
        });

        it('should work with get/set style props', () => {
            _router.publishEvent('entityId', 'aSubEvent2', {});
            expect(_subEntityWithExistingGetSetIsDirtyPropWasDirty).toEqual(true);
            expect(_entity.subEntityWithExistingIsDirtyProp.isDirty).toEqual(false);
        });

        it('should track dirty when decorator declared on base class', () => {
            _router.publishEvent('derivedEntityId', 'aDerivedEntityEvent', {});
            expect(_derivedEntityWasDirty).toEqual(true);
            expect(_derivedEntity.isDirty).toEqual(false);
        });
    });
});