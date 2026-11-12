import * as React from 'react';
import {act} from 'react';
import {render, screen} from '@testing-library/react';
import {EventBus} from 'esp-js';
import {
    ConnectableComponent,
    EspEventBusContextProvider,
    EspModulesContext,
    RegionView,
    syncStoreModelWithSelectorOptions,
    useSyncStoreModelWithSelector
} from '../src';

type Counter = { n: number, labels: Record<string, string> };

const registerCounterStore = (bus: EventBus, storeId: string) => {
    bus.storeBuilder<Counter>(storeId, {n: 0, labels: {a: 'A', b: 'B'}})
        .withEventHandler('Inc', draft => { draft.n++; })
        .build();
};

describe('esp-js-react review fixes', () => {
    let bus: EventBus;

    beforeEach(() => {
        bus = new EventBus();
    });

    describe('store registered after mount', () => {
        const HookView = () => {
            const n = useSyncStoreModelWithSelector<Counter, number>(
                m => m.n,
                syncStoreModelWithSelectorOptions<number>().setStoreId('late')
            );
            return <span data-testid='hook'>{n == null ? 'none' : `n=${n}`}</span>;
        };
        const ConnectedView = ({model}: { model: Counter }) => <span data-testid='connected'>{`n=${model.n}`}</span>;

        it('useSyncStoreModelWithSelector and ConnectableComponent pick up the model once the store is registered', () => {
            render(
                <EspEventBusContextProvider bus={bus}>
                    <HookView />
                    <ConnectableComponent storeId='late' view={ConnectedView} />
                </EspEventBusContextProvider>
            );
            expect(screen.getByTestId('hook').textContent).toBe('none');
            expect(screen.queryByTestId('connected')).toBeNull();

            act(() => {
                registerCounterStore(bus, 'late');
            });
            expect(screen.getByTestId('hook').textContent).toBe('n=0');
            expect(screen.getByTestId('connected').textContent).toBe('n=0');

            act(() => {
                bus.publishEvent('late', 'Inc', {});
            });
            expect(screen.getByTestId('hook').textContent).toBe('n=1');
            expect(screen.getByTestId('connected').textContent).toBe('n=1');
        });
    });

    describe('selector that closes over props', () => {
        const LabelView = ({labelKey}: { labelKey: string }) => {
            const label = useSyncStoreModelWithSelector<Counter, string>(
                m => m.labels[labelKey],
                syncStoreModelWithSelectorOptions<string>().setStoreId('c')
            );
            return <span data-testid='label'>{label}</span>;
        };

        it('uses the latest selector when the prop it closes over changes', () => {
            registerCounterStore(bus, 'c');
            const {rerender} = render(
                <EspEventBusContextProvider bus={bus}><LabelView labelKey='a' /></EspEventBusContextProvider>
            );
            expect(screen.getByTestId('label').textContent).toBe('A');
            rerender(
                <EspEventBusContextProvider bus={bus}><LabelView labelKey='b' /></EspEventBusContextProvider>
            );
            expect(screen.getByTestId('label').textContent).toBe('B');
        });
    });

    describe('RegionView', () => {
        it('renders two views bound to the same store in one region without duplicate keys', () => {
            registerCounterStore(bus, 'c');
            const ViewA = ({model}: { model: Counter }) => <span data-testid='a'>{`a${model.n}`}</span>;
            const ViewB = ({model}: { model: Counter }) => <span data-testid='b'>{`b${model.n}`}</span>;
            const modules: any[] = [{
                moduleId: 'm',
                viewBindings: [
                    {storeId: 'c', viewComponent: ViewA, region: 'main'},
                    {storeId: 'c', viewComponent: ViewB, region: 'main'},
                ]
            }];
            const error = vi.spyOn(console, 'error');
            try {
                render(
                    <EspEventBusContextProvider bus={bus}>
                        <EspModulesContext.Provider value={modules}>
                            <RegionView regionName='main' />
                        </EspModulesContext.Provider>
                    </EspEventBusContextProvider>
                );
                act(() => {
                    bus.publishEvent('c', 'Inc', {});
                });
                expect(screen.getByTestId('a').textContent).toBe('a1');
                expect(screen.getByTestId('b').textContent).toBe('b1');
                const keyErrors = error.mock.calls.filter(c => String(c[0]).includes('same key'));
                expect(keyErrors).toEqual([]);
            } finally {
                error.mockRestore();
            }
        });
    });
});
