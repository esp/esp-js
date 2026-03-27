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

interface SimpleModel {
    value: number;
}

describe('StoreBuilder', () => {

    let _bus: esp.EventBus;

    beforeEach(() => {
        _bus = new esp.EventBus();
    });

    describe('registration (build)', () => {

        it('model is registered with the router after build', () => {
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 }).build();
            expect(_bus.isModelRegistered('myModel')).toBe(true);
        });

        it('bus.removeStore() removes the model', () => {
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 }).build();
            expect(_bus.isModelRegistered('myModel')).toBe(true);
            _bus.removeStore('myModel');
            expect(_bus.isModelRegistered('myModel')).toBe(false);
        });

        it('bus.removeStore() disposes subscription factories', () => {
            let disposeCalled = false;
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 })
                .withEventSubscription(() => ({ dispose: () => { disposeCalled = true; } }))
                .build();
            _bus.removeStore('myModel');
            expect(disposeCalled).toBe(true);
        });

        it('event handler registered via withEventHandler fires on publishEvent', () => {
            let received = false;
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 })
                .withEventHandler('AnEvent', () => { received = true; })
                .build();
            _bus.publishEvent('myModel', 'AnEvent', {});
            expect(received).toBe(true);
        });

        it('isModelRegistered returns false before registration', () => {
            expect(_bus.isModelRegistered('notYet')).toBe(false);
        });

        it('isModelRegistered returns false after removeStore', () => {
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 }).build();
            _bus.removeStore('myModel');
            expect(_bus.isModelRegistered('myModel')).toBe(false);
        });

        it('throws if the same modelId is registered twice', () => {
            _bus.storeBuilder<SimpleModel>('myModel', { value: 0 }).build();
            expect(() => {
                _bus.storeBuilder<SimpleModel>('myModel', { value: 0 }).build();
            }).toThrow();
        });
    });
});
