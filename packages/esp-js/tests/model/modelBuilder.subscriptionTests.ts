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
import {Disposable} from '../../src/system/disposables';

interface SimpleModel {
    value: number;
}

describe('ModelBuilder', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('subscription factories (withEventSubscription)', () => {

        it('subscription factory is called when model is registered', () => {
            let factoryCalled = false;
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withEventSubscription((publish) => {
                    factoryCalled = true;
                    return { dispose: () => {} };
                })
                .build();
            expect(factoryCalled).toBe(true);
        });

        it('subscription factory receives publish delegate that can publish events', () => {
            let publishCalledWith: { eventType: string; event: any } = null;
            let factoryPublish: (eventType: string, event: any) => void = null;

            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withEventHandler<{ amount: number }>('Add', (draft, event) => {
                    draft.value += event.amount;
                })
                .withEventSubscription((publish) => {
                    factoryPublish = publish;
                    return { dispose: () => {} };
                })
                .build();

            let lastModel: SimpleModel = null;
            _router.getModelObservable<SimpleModel>('model').subscribe(m => { lastModel = m; });

            // Use the captured publish delegate to publish outside normal flow
            factoryPublish('Add', { amount: 10 });

            expect(lastModel).toBeDefined();
            expect(lastModel.value).toEqual(10);
        });

        it('dispose returned from subscription factory is called on model removal', () => {
            let disposeCalled = false;
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withEventSubscription((publish): Disposable => {
                    return {
                        dispose: () => { disposeCalled = true; }
                    };
                })
                .build();
            _router.removeModel('model');
            expect(disposeCalled).toBe(true);
        });

        it('multiple subscription factories are all called', () => {
            const calls: string[] = [];
            _router.modelBuilder<SimpleModel>('model', { value: 0 })
                .withEventSubscription((publish) => {
                    calls.push('factory1');
                    return { dispose: () => {} };
                })
                .withEventSubscription((publish) => {
                    calls.push('factory2');
                    return { dispose: () => {} };
                })
                .build();
            expect(calls).toEqual(['factory1', 'factory2']);
        });
    });
});
