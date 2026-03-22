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
import {ModelBuilder} from '../../src/model/modelBuilder';

interface SimpleModel {
    value: number;
}

describe('ModelBuilder', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('registration (registerWithRouter)', () => {

        it('model is registered with the router after registerWithRouter', () => {
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 }).registerWithRouter();
            expect(_router.isModelRegistered('myModel')).toBe(true);
        });

        it('router.removeModel() removes the model', () => {
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 }).registerWithRouter();
            expect(_router.isModelRegistered('myModel')).toBe(true);
            _router.removeModel('myModel');
            expect(_router.isModelRegistered('myModel')).toBe(false);
        });

        it('router.removeModel() disposes subscription factories', () => {
            let disposeCalled = false;
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 })
                .withEventSubscription(() => ({ dispose: () => { disposeCalled = true; } }))
                .registerWithRouter();
            _router.removeModel('myModel');
            expect(disposeCalled).toBe(true);
        });

        it('event handler registered via withEventHandler fires on publishEvent', () => {
            let received = false;
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 })
                .withEventHandler('AnEvent', () => { received = true; })
                .registerWithRouter();
            _router.publishEvent('myModel', 'AnEvent', {});
            expect(received).toBe(true);
        });

        it('isModelRegistered returns false before registration', () => {
            expect(_router.isModelRegistered('notYet')).toBe(false);
        });

        it('isModelRegistered returns false after removeModel', () => {
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 }).registerWithRouter();
            _router.removeModel('myModel');
            expect(_router.isModelRegistered('myModel')).toBe(false);
        });

        it('throws if the same modelId is registered twice', () => {
            new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 }).registerWithRouter();
            expect(() => {
                new ModelBuilder<SimpleModel>(_router, 'myModel', { value: 0 }).registerWithRouter();
            }).toThrow();
        });
    });
});
