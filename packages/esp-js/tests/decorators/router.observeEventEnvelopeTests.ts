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

import {DisposableBase, ObservationStage, observeEventEnvelope, Router} from '../../src';

describe('Decorators', () => {

    let _router, _model: Model;

    beforeEach(() => {
        _router = new Router();
    });

    class Model extends DisposableBase {
        private _id: string;
        private _router: Router;
        public receivedEvent: Array<any>;
        public receivedAllEvent: Array<any>;

        constructor(id, router) {
            super();
            this._id = id;
            this._router = router;
            this.receivedEvent = [];
            this.receivedAllEvent = [];
        }

        observeEvents() {
            this._router.addModel('modelId', this);
            this.addDisposable(this._router.observeEventsOn(this._id, this));
        }

        //start-non-standard
        @observeEventEnvelope('fooEvent')
        _onFooEventAtPreviewAtNormal(envelope) {
            this.receivedEvent.push(envelope);
        }

        //start-non-standard
        @observeEventEnvelope('barEvent', ObservationStage.all)
        _onBarEventAtAll(envelope) {
            this.receivedAllEvent.push(envelope);
            if (ObservationStage.isNormal(envelope.observationStage)) {
                envelope.context.commit();
            }
        }
    }

    beforeEach(() => {
        _model = new Model('modelId', _router);
        _model.observeEvents();
    });

    it('should observe events by event name', () => {
        _router.publishEvent('modelId', 'fooEvent', 1);
        expect(_model.receivedEvent.length).toBe(1);
        expect(_model.receivedEvent[0].event).toBe(1);
        expect(_model.receivedEvent[0].model).toBe(_model);
    });

    it('should observe all events events by event name', () => {
        _router.publishEvent('modelId', 'barEvent', 1);
        expect(_model.receivedAllEvent.length).toBe(4);

        expect(_model.receivedAllEvent[0].event).toBe(1);
        expect(_model.receivedAllEvent[0].model).toBe(_model);
        expect(_model.receivedAllEvent[0].observationStage).toBe(ObservationStage.preview);

        expect(_model.receivedAllEvent[1].event).toBe(1);
        expect(_model.receivedAllEvent[1].model).toBe(_model);
        expect(_model.receivedAllEvent[1].observationStage).toBe(ObservationStage.normal);

        expect(_model.receivedAllEvent[2].event).toBe(1);
        expect(_model.receivedAllEvent[2].model).toBe(_model);
        expect(_model.receivedAllEvent[2].observationStage).toBe(ObservationStage.committed);

        expect(_model.receivedAllEvent[3].event).toBe(1);
        expect(_model.receivedAllEvent[3].model).toBe(_model);
        expect(_model.receivedAllEvent[3].observationStage).toBe(ObservationStage.final);
    });
});
