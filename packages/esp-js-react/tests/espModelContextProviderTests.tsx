import {
    EspRouterContextProvider,
    EspModelContextProvider,
    useGetModelId,
    useGetModel,
    usePublishModelEvent,
    usePublishModelEventWithEntityKey
} from '../src';
import {testApi, TestApi} from './testApi/testApi';
import {renderHook} from '@testing-library/react';
import * as React from 'react';
import {Router} from 'esp-js';
import {TestModelState} from './testApi/testModel';

describe('EspModelContextProviderTests tests', () => {
    let api: TestApi,
        testModel1: TestModelState,
        testModel2: TestModelState;

    beforeEach(() => {
        api = testApi();

        testModel1 = api.setupTestModel('model-id1');
        testModel2 = api.setupTestModel('model-id2');
    });

    // https://testing-library.com/docs/react-testing-library/api/#renderhook-options-initialprops
    const createEspRouterContextProviderWrapper = (
        router: Router,
        modelsForContextPerRender: TestModelState[],
        modelIdForContextPerRender: string[]
    ) => {

        return ({children}: React.PropsWithChildren) => {
            // Each re-render we pop a model ID out of modelIdForContextPerRender for our context.
            // This is the only way to inject some re-render differences using RTL with renderHook
            let modelForContext = modelsForContextPerRender.length === 1
                ? modelsForContextPerRender[0]
                : modelsForContextPerRender.shift();
            let modelIdForContext = modelIdForContextPerRender.length === 1
                ? modelIdForContextPerRender[0]
                : modelIdForContextPerRender.shift();
            return (
                <EspRouterContextProvider router={router}>
                    <EspModelContextProvider modelId={modelIdForContext} model={modelForContext}>
                        {children},
                    </EspModelContextProvider>
                </EspRouterContextProvider>
            );
        };
    };

    it('useGetModelId returns new modelId and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return useGetModelId();
            },
            {
                wrapper: createEspRouterContextProviderWrapper(
                    api.router,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );
        expect(result.current).toBe('model-id1');
        rerender();
        expect(result.current).toBe('model-id2');
    });

    it('useGetModel returns model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return useGetModel<TestModelState>();
            },
            {
                wrapper: createEspRouterContextProviderWrapper(
                    api.router,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );
        expect(result.current).toBe(testModel1);
        rerender();
        expect(result.current).toBe(testModel2);
    });

    it('publishModelEvent publishes to correct model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return usePublishModelEvent();
            },
            {
                wrapper: createEspRouterContextProviderWrapper(
                    api.router,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );

        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('initial-value');
        result.current('test-event', 'updated');
        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('updated');
        result.current({eventType: 'test-event', event: 'updated2' });
        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('updated2');

        rerender();

        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('initial-value');
        result.current('test-event', 'updated');
        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('updated');
        result.current({eventType: 'test-event', event: 'updated2' });
        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('updated2');
    });

    it('publishModelEventWithEntityKey publishes to correct model and changes on re-render', () => {
        const {result, rerender} = renderHook(
            props => {
                return usePublishModelEventWithEntityKey();
            },
            {
                wrapper: createEspRouterContextProviderWrapper(
                    api.router,
                    [testModel1, testModel2],
                    ['model-id1', 'model-id2']
                ),
            }
        );

        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('initial-value');
        expect(api.router.getModel<TestModelState>('model-id1').entityKey).toBe('');
        result.current('the-entity-key', 'test-event-with-entity-key', 'updated');
        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('updated');
        expect(api.router.getModel<TestModelState>('model-id1').entityKey).toBe('the-entity-key');
        result.current({ entityKey: 'the-entity-key', eventType: 'test-event-with-entity-key', event: 'updated2'});
        expect(api.router.getModel<TestModelState>('model-id1').value).toBe('updated2');

        rerender();

        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('initial-value');
        expect(api.router.getModel<TestModelState>('model-id2').entityKey).toBe('');
        result.current('the-entity-key', 'test-event-with-entity-key', 'updated');
        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('updated');
        expect(api.router.getModel<TestModelState>('model-id2').entityKey).toBe('the-entity-key');
        result.current({ entityKey: 'the-entity-key', eventType: 'test-event-with-entity-key', event: 'updated2'});
        expect(api.router.getModel<TestModelState>('model-id2').value).toBe('updated2');
    });
});