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

interface OrderModel {
    orderId: string;
    status: string;
}

describe('ModelBuilder', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('effect handlers (withEffect)', () => {

        it('effect handler receives the publish delegate and can publish a follow-up event', () => {
            const publishedEvents: string[] = [];
            let effectModelSnapshot: Readonly<OrderModel> = null;

            new ModelBuilder<OrderModel>(_router, 'orders', { orderId: 'o1', status: 'new' })
                .withEventHandler<{ newStatus: string }>('StatusChanged', (draft, event) => {
                    draft.status = event.newStatus;
                })
                .withEffect<{ newStatus: string }>('StatusChanged', (model, event, ctx, publish) => {
                    effectModelSnapshot = model;
                    publishedEvents.push(`effect-for-${event.newStatus}`);
                    publish('StatusEffect', { triggeredBy: event.newStatus });
                })
                .registerWithRouter();

            _router.getEventObservable('orders', 'StatusChanged').subscribe(() => {});
            let effectEventReceived: any = null;
            _router.getEventObservable('orders', 'StatusEffect').subscribe(({event}: any) => {
                effectEventReceived = event;
            });

            _router.publishEvent('orders', 'StatusChanged', { newStatus: 'confirmed' });

            expect(publishedEvents).toEqual(['effect-for-confirmed']);
            expect(effectEventReceived).toEqual({ triggeredBy: 'confirmed' });
        });

        it('effect handler receives readonly model — mutation throws', () => {
            let effectModel: Readonly<OrderModel> = null;
            new ModelBuilder<OrderModel>(_router, 'orders', { orderId: 'o1', status: 'new' })
                .withEffect<any>('AnEvent', (model, event, ctx, publish) => {
                    effectModel = model;
                })
                .registerWithRouter();
            _router.getEventObservable('orders', 'AnEvent', esp.ObservationStage.final).subscribe(() => {});
            _router.publishEvent('orders', 'AnEvent', {});
            expect(effectModel).toBeDefined();
            expect(() => { (effectModel as any).status = 'mutated'; }).toThrow();
        });

        it('multiple effect handlers for the same event are all called', () => {
            const calls: string[] = [];
            new ModelBuilder<OrderModel>(_router, 'orders', { orderId: 'o1', status: 'new' })
                .withEffect<any>('AnEvent', () => { calls.push('effect1'); })
                .withEffect<any>('AnEvent', () => { calls.push('effect2'); })
                .registerWithRouter();
            _router.getEventObservable('orders', 'AnEvent', esp.ObservationStage.final).subscribe(() => {});
            _router.publishEvent('orders', 'AnEvent', {});
            expect(calls).toEqual(['effect1', 'effect2']);
        });

        it('effect runs after normal handlers complete (model reflects mutations)', () => {
            let effectSawStatus = '';
            new ModelBuilder<OrderModel>(_router, 'orders', { orderId: 'o1', status: 'new' })
                .withEventHandler<{ newStatus: string }>('StatusChanged', (draft, event) => {
                    draft.status = event.newStatus;
                })
                .withEffect<{ newStatus: string }>('StatusChanged', (model) => {
                    effectSawStatus = model.status;
                })
                .registerWithRouter();
            _router.getEventObservable('orders', 'StatusChanged').subscribe(() => {});
            _router.publishEvent('orders', 'StatusChanged', { newStatus: 'shipped' });
            // The effect runs after normal dispatch, so model.status should already be 'shipped'
            expect(effectSawStatus).toEqual('shipped');
        });
    });
});
