import {
    EspEventBusContextProvider,
    EspStoreContextProvider,
    useGetStoreId,
    useGetStore,
    usePublishStoreEvent,
    usePublishStoreEventWithEntityKey
} from '../src';
import {testApi, TestApi} from './testApi/testApi';
import {renderHook} from '@testing-library/react';
import * as React from 'react';
import {EventBus} from 'esp-js';
import {TestModelState} from './testApi/testModel';

describe('EspStoreContextProviderTests tests', () => {
    let api: TestApi,
        testModel1: TestModelState,
        testModel2: TestModelState;

    beforeEach(() => {
        api = testApi();

        testModel1 = api.setupTestModel('model-id1');
        testModel2 = api.setupTestModel('model-id2');
    });

    // https://testing-library.com/docs/react-testing-library/api/#renderhook-options-initialprops
    const createEspEventBusContextProviderWrapper = (
        bus: EventBus,
        modelsForContextPerRender: TestModelState[],
        storeIdForContextPerRender: string[]
    ) => {

        return ({children}: React.PropsWithChildren) => {
            // Each re-render we pop a store ID out of storeIdForContextPerRender for our context.
            // This is the only way to inject some re-render differences using RTL with renderHook
            let modelForContext = modelsForContextPerRender.length === 1
                ? modelsForContextPerRender[0]
                : modelsForContextPerRender.shift();
            let storeIdForContext = storeIdForContextPerRender.length === 1
                ? storeIdForContextPerRender[0]
                : storeIdForContextPerRender.shift();
            return (
                <EspEventBusContextProvider bus={bus}>
                    <EspStoreContextProvider storeId={storeIdForContext} model={modelForContext}>
                        {children},
                    </EspStoreContextProvider>
                </EspEventBusContextProvider>
            );
        };
    };

    it('useGetStoreId returns new storeId and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return useGetStoreId();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(
                    api.bus,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );
        expect(result.current).toBe('model-id1');
        rerender();
        expect(result.current).toBe('model-id2');
    });

    it('useGetStore returns model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return useGetStore<TestModelState>();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(
                    api.bus,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );
        expect(result.current).toBe(testModel1);
        rerender();
        expect(result.current).toBe(testModel2);
    });

    it('publishStoreEvent publishes to correct model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return usePublishStoreEvent();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(
                    api.bus,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );

        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('initial-value');
        result.current('test-event', 'updated');
        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('updated');
        result.current({eventType: 'test-event', event: 'updated2' });
        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('updated2');

        rerender();

        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('initial-value');
        result.current('test-event', 'updated');
        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('updated');
        result.current({eventType: 'test-event', event: 'updated2' });
        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('updated2');
    });

    it('publishStoreEventWithEntityKey publishes to correct model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return usePublishStoreEventWithEntityKey();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(
                    api.bus,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );

        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('initial-value');
        expect(api.bus.getModel<TestModelState>('model-id1').entityKey).toBe('');
        result.current('the-entity-key', 'test-event-with-entity-key', 'updated');
        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('updated');
        expect(api.bus.getModel<TestModelState>('model-id1').entityKey).toBe('the-entity-key');
        result.current({ entityKey: 'the-entity-key', eventType: 'test-event-with-entity-key', event: 'updated2'});
        expect(api.bus.getModel<TestModelState>('model-id1').value).toBe('updated2');

        rerender();

        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('initial-value');
        expect(api.bus.getModel<TestModelState>('model-id2').entityKey).toBe('');
        result.current('the-entity-key', 'test-event-with-entity-key', 'updated');
        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('updated');
        expect(api.bus.getModel<TestModelState>('model-id2').entityKey).toBe('the-entity-key');
        result.current({ entityKey: 'the-entity-key', eventType: 'test-event-with-entity-key', event: 'updated2'});
        expect(api.bus.getModel<TestModelState>('model-id2').value).toBe('updated2');
    });
});
