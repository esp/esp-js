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

interface MapSetModel {
    prices: Map<string, number>;
    tags: Set<string>;
}

describe('EventBus', () => {
    describe('Map and Set in a model', () => {
        it('lets a handler change a Map and a Set on the draft', () => {
            const bus = new esp.EventBus();
            const model: MapSetModel = { prices: new Map([['a', 1]]), tags: new Set(['x']) };
            bus.storeBuilder<MapSetModel>('store', model)
                .withEventHandler<{ key: string, price: number }>('setPrice', (draft, event) => {
                    draft.prices.set(event.key, event.price);
                    draft.tags.add(event.key);
                })
                .build();

            bus.publishEvent('store', 'setPrice', { key: 'b', price: 2 });

            const next = bus.getStoreModel<MapSetModel>('store');
            expect(next.prices.get('a')).toBe(1);
            expect(next.prices.get('b')).toBe(2);
            expect(Array.from(next.tags)).toEqual(['x', 'b']);
            expect(next).not.toBe(model);
            expect(model.prices.has('b')).toBe(false);
            expect(model.tags.has('b')).toBe(false);
        });
    });
});
