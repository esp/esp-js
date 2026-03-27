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

import {EventBus} from '../../src';

describe('EventBus', () => {

    let _bus;

    beforeEach(() => {
        _bus = new EventBus();
    });

    describe('.broadcast()', function() {
        it('throws if arguments incorrect', () => {
            expect(() => {_bus.broadcastEvent(undefined, 'foo'); }).toThrow();
            expect(() => {_bus.broadcastEvent('anEvent', undefined); }).toThrow();
        });

        it('should deliver the event to all models observing event', () => {
            let model1ProcessorReceived = 0, model2ProcessorReceived = 0;
            _bus.storeBuilder('modelId1', {})
                .withEventHandler<number>('Event1', (draft, event) => { model1ProcessorReceived += event; })
                .build();
            _bus.storeBuilder('modelId2', {})
                .withEventHandler<number>('Event1', (draft, event) => { model2ProcessorReceived += event; })
                .build();
            _bus.broadcastEvent('Event1', 10);
            expect(model1ProcessorReceived).toEqual(10);
            expect(model2ProcessorReceived).toEqual(10);
        });

        it('should not deliver the event to models not observing event', () => {
            let model1ProcessorReceivedCount = 0, model2ProcessorReceivedCount = 0;
            let model1ReceivedEvents: string[] = [];
            let model2ReceivedEvents: string[] = [];
            // first: model1 observes Event1, model2 does not
            _bus.storeBuilder('modelId1', {})
                .withEventHandler('Event1', (draft, event, ctx) => {
                    model1ProcessorReceivedCount++;
                    model1ReceivedEvents.push(ctx.modelId);
                })
                .build();
            _bus.storeBuilder('modelId2', {})
                .withEventHandler('Event1', (draft, event, ctx) => {
                    model2ProcessorReceivedCount++;
                    model2ReceivedEvents.push(ctx.modelId);
                })
                .build();

            _bus.broadcastEvent('Event1', 10);
            expect(model1ProcessorReceivedCount).toEqual(1);
            expect(model2ProcessorReceivedCount).toEqual(1);

            _bus.broadcastEvent('Event1', 20);
            expect(model1ProcessorReceivedCount).toEqual(2);
            expect(model2ProcessorReceivedCount).toEqual(2);
            // Verify events were delivered to both models
            expect(model1ReceivedEvents).toEqual(['modelId1', 'modelId1']);
            expect(model2ReceivedEvents).toEqual(['modelId2', 'modelId2']);
        });
    });
});
