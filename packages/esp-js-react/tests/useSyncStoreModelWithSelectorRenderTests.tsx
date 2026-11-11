import * as React from 'react';
import {act} from 'react';
import {render} from '@testing-library/react';
import {EventBus} from 'esp-js';
import {EspEventBusContextProvider, syncStoreModelWithSelectorOptions, useSyncStoreModelWithSelector} from '../src';

type Counter = { n: number };

describe('useSyncStoreModelWithSelector render behaviour', () => {
    let bus: EventBus;
    let renderCount: number;
    let lastValue: number;

    const View = () => {
        renderCount++;
        lastValue = useSyncStoreModelWithSelector<Counter, number>(
            m => m.n,
            syncStoreModelWithSelectorOptions<number>().setStoreId('c')
        );
        return null;
    };

    beforeEach(() => {
        renderCount = 0;
        lastValue = undefined;
        bus = new EventBus();
        bus.storeBuilder<Counter>('c', {n: 0})
            .withEventHandler('Inc', draft => { draft.n++; })
            .withEventHandler('NoOp', () => { /* doesn't change the model */ })
            .build();
    });

    it('renders once on mount (the replayed current model does not cause a re-render)', () => {
        render(<EspEventBusContextProvider bus={bus}><View /></EspEventBusContextProvider>);
        expect(renderCount).toBe(1);
        expect(lastValue).toBe(0);
    });

    it('does not log a warning on mount', () => {
        const warn = vi.spyOn(console, 'warn');
        const error = vi.spyOn(console, 'error');
        try {
            render(<EspEventBusContextProvider bus={bus}><View /></EspEventBusContextProvider>);
            expect(warn).not.toHaveBeenCalled();
            expect(error).not.toHaveBeenCalled();
        } finally {
            warn.mockRestore();
            error.mockRestore();
        }
    });

    it('re-renders when the model changes, not when an event leaves it unchanged', () => {
        render(<EspEventBusContextProvider bus={bus}><View /></EspEventBusContextProvider>);
        act(() => { bus.publishEvent('c', 'NoOp', {}); });
        expect(renderCount).toBe(1);
        act(() => { bus.publishEvent('c', 'Inc', {}); });
        expect(renderCount).toBe(2);
        expect(lastValue).toBe(1);
    });
});
