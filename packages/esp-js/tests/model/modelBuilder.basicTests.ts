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

interface Counter {
    count: number;
    label: string;
}

describe('ModelBuilder', () => {

    let _router: esp.Router;

    beforeEach(() => {
        _router = new esp.Router();
    });

    describe('basic event handler registration', () => {

        it('registers a model and dispatches events to withEventHandler', () => {
            let receivedEvent: any = null;
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withEventHandler('Increment', (draft, event) => {
                    draft.count += event.amount;
                    receivedEvent = event;
                })
                .registerWithRouter();
            _router.getEventObservable('counter', 'Increment').subscribe(() => {});
            _router.publishEvent('counter', 'Increment', { amount: 5 });
            expect(receivedEvent).toEqual({ amount: 5 });
        });

        it('applies immer draft mutations — model emitted is updated', () => {
            let lastModel: Counter = null;
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withEventHandler<{ amount: number }>('Increment', (draft, event) => {
                    draft.count += event.amount;
                })
                .registerWithRouter();
            _router.getModelObservable<Counter>('counter').subscribe(m => { lastModel = m; });
            _router.publishEvent('counter', 'Increment', { amount: 3 });
            expect(lastModel).toBeDefined();
            expect(lastModel.count).toEqual(3);
        });

        it('accumulated mutations are reflected in model', () => {
            let lastModel: Counter = null;
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withEventHandler<{ amount: number }>('Increment', (draft, event) => {
                    draft.count += event.amount;
                })
                .registerWithRouter();
            _router.getModelObservable<Counter>('counter').subscribe(m => { lastModel = m; });
            _router.publishEvent('counter', 'Increment', { amount: 3 });
            _router.publishEvent('counter', 'Increment', { amount: 7 });
            expect(lastModel.count).toEqual(10);
        });

        it('model is frozen — direct mutation outside handler throws', () => {
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .registerWithRouter();
            let frozenModel: Counter = null;
            _router.getModelObservable<Counter>('counter').subscribe(m => { frozenModel = m; });
            expect(frozenModel).toBeDefined();
            expect(() => {
                (frozenModel as any).count = 99;
            }).toThrow();
        });

        it('supports multiple event handlers for the same event type', () => {
            const calls: string[] = [];
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withEventHandler('AnEvent', () => { calls.push('handler1'); })
                .withEventHandler('AnEvent', () => { calls.push('handler2'); })
                .registerWithRouter();
            _router.getEventObservable('counter', 'AnEvent').subscribe(() => {});
            _router.publishEvent('counter', 'AnEvent', {});
            expect(calls).toEqual(['handler1', 'handler2']);
        });

        it('supports multiple event types on the same model', () => {
            const calls: string[] = [];
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withEventHandler('EventA', () => { calls.push('A'); })
                .withEventHandler('EventB', () => { calls.push('B'); })
                .registerWithRouter();
            _router.getEventObservable('counter', 'EventA').subscribe(() => {});
            _router.getEventObservable('counter', 'EventB').subscribe(() => {});
            _router.publishEvent('counter', 'EventA', {});
            _router.publishEvent('counter', 'EventB', {});
            expect(calls).toEqual(['A', 'B']);
        });

        it('withEventHandler throws if eventType is not a string', () => {
            expect(() => {
                new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                    .withEventHandler(undefined, () => {});
            }).toThrow();
        });

        it('withEventHandler throws if handler is not a function', () => {
            expect(() => {
                new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                    .withEventHandler('AnEvent', undefined);
            }).toThrow();
        });
    });

    describe('pre and post event processors', () => {

        it('withPreEventProcessor is called before each event batch', () => {
            const calls: string[] = [];
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withPreEventProcessor(() => { calls.push('pre'); })
                .registerWithRouter();
            _router.getEventObservable('counter', 'AnEvent').subscribe(() => { calls.push('handler'); });
            _router.publishEvent('counter', 'AnEvent', {});
            expect(calls).toEqual(['pre', 'handler']);
        });

        it('withPostEventProcessor is called after each event batch', () => {
            const calls: string[] = [];
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withPostEventProcessor(() => { calls.push('post'); })
                .registerWithRouter();
            _router.getEventObservable('counter', 'AnEvent').subscribe(() => { calls.push('handler'); });
            _router.publishEvent('counter', 'AnEvent', {});
            expect(calls).toEqual(['handler', 'post']);
        });

        it('withPostEventProcessor receives the list of processed event types', () => {
            let processedEvents: string[] = null;
            new ModelBuilder<Counter>(_router, 'counter', { count: 0, label: 'test' })
                .withPostEventProcessor((model, events) => { processedEvents = events; })
                .registerWithRouter();
            _router.getEventObservable('counter', 'Foo').subscribe(() => {});
            _router.publishEvent('counter', 'Foo', {});
            expect(processedEvents).toEqual(['Foo']);
        });
    });
});
