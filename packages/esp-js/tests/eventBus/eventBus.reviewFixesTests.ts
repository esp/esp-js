import * as esp from '../../src';
import {vi} from 'vitest';

type Counter = { n: number };

describe('EventBus', () => {

    let _bus: esp.EventBus;

    beforeEach(() => {
        _bus = new esp.EventBus();
    });

    describe('effects', () => {

        it('each effect sees the model as it was right after its own event', () => {
            const seen: number[] = [];
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Start', () => {})
                .withEventHandler('Inc', draft => { draft.n++; })
                .withEffect('Inc', model => { seen.push(model.n); })
                .withEffect('Start', (model, e, ctx, publish) => {
                    publish('Inc', {});
                    publish('Inc', {});
                })
                .build();
            _bus.publishEvent('c', 'Start', {});
            expect(seen).toEqual([1, 2]);
        });

        it('the effect snapshot is frozen', () => {
            let snapshot: Counter = null;
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Inc', draft => { draft.n++; })
                .withEffect('Inc', model => { snapshot = model as Counter; })
                .build();
            _bus.publishEvent('c', 'Inc', {});
            expect(Object.isFrozen(snapshot)).toBe(true);
            expect(snapshot.n).toBe(1);
        });

        it('events an effect publishes synchronously to its own store are included in a single model update', () => {
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Start', () => {})
                .withEventHandler('Inc', draft => { draft.n++; })
                .withEffect('Start', (model, e, ctx, publish) => {
                    publish('Inc', {});
                    publish('Inc', {});
                })
                .build();
            const updates: number[] = [];
            _bus.getStoreModelObservable<Counter>('c').subscribe(m => updates.push(m.n));
            updates.length = 0; // ignore the replay of the current model on subscribe
            _bus.publishEvent('c', 'Start', {});
            expect(updates).toEqual([2]);
        });

        it('events an effect publishes to another store are processed after the current store update', () => {
            const order: string[] = [];
            _bus.storeBuilder<Counter>('a', {n: 0})
                .withEventHandler('Go', draft => { draft.n++; })
                .withEffect('Go', (model, e, ctx) => { _bus.publishEvent('b', 'Go', {}); })
                .build();
            _bus.storeBuilder<Counter>('b', {n: 0})
                .withEventHandler('Go', draft => { draft.n++; })
                .build();
            _bus.getStoreModelObservable<Counter>('a').subscribe(m => order.push(`a:${m.n}`));
            _bus.getStoreModelObservable<Counter>('b').subscribe(m => order.push(`b:${m.n}`));
            order.length = 0;
            _bus.publishEvent('a', 'Go', {});
            expect(order).toEqual(['a:1', 'b:1']);
        });

        it('a circular effect loop on one store is halted by the dispatch limit', () => {
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Ping', draft => { draft.n++; })
                .withEffect('Ping', (model, e, ctx, publish) => { publish('Ping', {}); })
                .build();
            expect(() => _bus.publishEvent('c', 'Ping', {})).toThrow(/Circular event dispatch detected/);
        });
    });

    describe('dispatch loop limits and halting', () => {

        it('a handler that publishes to its own store forever is halted by the dispatch limit, not hung', () => {
            let handled = 0;
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Ping', () => {
                    handled++;
                    _bus.publishEvent('c', 'Ping', {});
                })
                .build();
            expect(() => _bus.publishEvent('c', 'Ping', {})).toThrow(/Circular event dispatch detected/);
            expect(handled).toBeLessThan(10001);
        });

        it('a handler that publishes a bounded chain to its own store is not affected by the limit', () => {
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Inc', draft => {
                    draft.n++;
                    if (draft.n < 100) {
                        _bus.publishEvent('c', 'Inc', {});
                    }
                })
                .build();
            _bus.publishEvent('c', 'Inc', {});
            expect(_bus.getStoreModel<Counter>('c').n).toEqual(100);
        });

        it('after a handler throws, getStoreModel returns the last good (frozen) model, not a revoked draft', () => {
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Inc', draft => { draft.n++; })
                .withEventHandler('Boom', draft => {
                    draft.n = 99;
                    throw new Error('boom');
                })
                .build();
            _bus.publishEvent('c', 'Inc', {});
            expect(() => _bus.publishEvent('c', 'Boom', {})).toThrow('boom');
            const model = _bus.getStoreModel<Counter>('c');
            expect(model.n).toEqual(1);
            expect(Object.isFrozen(model)).toBe(true);
            expect(_bus.findStoreModel((m: any) => m.n === 1)).toBe(model);
        });
    });

    describe('event processors', () => {

        it('pre and post event processors can write to the draft', () => {
            type Totals = { items: number[], total: number, rounds: number };
            _bus.storeBuilder<Totals>('t', {items: [], total: 0, rounds: 0})
                .withPreEventProcessor(draft => { draft.rounds++; })
                .withEventHandler('Add', (draft, e: number) => { draft.items.push(e); })
                .withPostEventProcessor(draft => { draft.total = draft.items.reduce((a, b) => a + b, 0); })
                .build();
            _bus.publishEvent('t', 'Add', 2);
            _bus.publishEvent('t', 'Add', 3);
            const model = _bus.getStoreModel<Totals>('t');
            expect(model.total).toEqual(5);
            expect(model.rounds).toEqual(2);
        });
    });

    describe('broadcastEvent', () => {

        it('does not throw when a store is observed before it is registered', () => {
            let received = 0;
            _bus.storeBuilder<Counter>('real', {n: 0})
                .withEventHandler('X', () => { received++; })
                .build();
            _bus.getStoreModelObservable('notYetRegistered').subscribe(() => {});
            expect(() => _bus.broadcastEvent('X', {})).not.toThrow();
            expect(received).toBe(1);
        });

        it('throws when the bus is disposed', () => {
            _bus.dispose();
            expect(() => _bus.broadcastEvent('X', {})).toThrow(/disposed/);
        });
    });

    describe('dispose', () => {

        it('disposes store subscriptions created with withEventSubscription', () => {
            let subscriptionDisposed = false;
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Inc', draft => { draft.n++; })
                .withEventSubscription(() => ({dispose: () => { subscriptionDisposed = true; }}))
                .build();
            _bus.dispose();
            expect(subscriptionDisposed).toBe(true);
            expect(_bus.isDisposed).toBe(true);
            expect(() => _bus.publishEvent('c', 'Inc', {})).toThrow(/disposed/);
        });

        it('is safe to call twice', () => {
            _bus.dispose();
            expect(() => _bus.dispose()).not.toThrow();
        });
    });

    describe('unhandled events', () => {

        it('warns when a published event has no handler on the target store', () => {
            // Note: sinks can't be removed, vitest isolates each test file so this doesn't leak.
            const sink = {log: vi.fn()};
            esp.LoggingConfig.addSinks(sink as any);
            _bus.storeBuilder<Counter>('c', {n: 0})
                .withEventHandler('Inc', draft => { draft.n++; })
                .build();
            _bus.publishEvent('c', 'Typo', {});
            const messages = sink.log.mock.calls.map(c => JSON.stringify(c[0]));
            expect(messages.some(m => m.includes('Typo') && m.includes('dropped'))).toBe(true);
        });
    });
});
