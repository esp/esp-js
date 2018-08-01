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

// NOTE these tests are copied into a few files as they need to run via different transpilers.
// I could have a single file, then source the tests and using eval to run them thus not having to copy and past this file, however debugging tests for each transpiler gets really hard.
// For now it's easiest to just copy paste from the .ts version, then remove the class level private vars from the babel implementation

import {DisposableBase, Router, observeEventEnvelope} from '../../src';

describe('Decorators', () => {

    let _router, _model: Model;

    beforeEach(() => {
        _router = new Router();
    });

    class Model extends DisposableBase {
        private _id: string;
        private _router: Router;
        public receivedEvent: Array<any>;

        constructor(id, router) {
            super();
            this._id = id;
            this._router = router;
            this.receivedEvent = [];
        }

        observeEvents() {
            this._router.addModel('modelId', this);
            this.addDisposable(this._router.observeEventsOn(this._id, this));
        }

        //start-non-standard
        @observeEventEnvelope('fooEvent')
        _fooEventAtPreview(envelope) {
            this.receivedEvent.push(envelope);
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
});
