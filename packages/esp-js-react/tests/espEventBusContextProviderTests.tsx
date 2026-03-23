import {
    EspEventBusContextProvider,
    useEventBus,
    usePublishEvent
} from '../src';
import {testApi, TestApi} from './testApi/testApi';
import {renderHook} from '@testing-library/react';
import {TestModelState} from './testApi/testModel';
import * as React from 'react';
import {EventBus} from 'esp-js';

describe('EspEventBusContextProvider tests', () => {
    let api: TestApi;

    beforeEach(() => {
        api = testApi();

        api.setupTestModel('model-id');
    });

    // https://testing-library.com/docs/react-testing-library/api/#renderhook-options-initialprops
    const createEspEventBusContextProviderWrapper = (bus: EventBus) => {
        return ({ children }: React.PropsWithChildren) => {
            return (<EspEventBusContextProvider bus={bus}>{children}</EspEventBusContextProvider>);
        };
    };

    it('useEventBus returns EventBus', () => {
        const {result} =renderHook(
            props => {
                return useEventBus();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(api.bus),
            }
        );
        expect(result.current).toBe(api.bus);
    });

    it('usePublishEvent returns publishEvent delegate', () => {
        const {result} =renderHook(
            props => {
                return usePublishEvent();
            },
            {
                wrapper: createEspEventBusContextProviderWrapper(api.bus),
            }
        );
        expect(api.bus.getModel<TestModelState>('model-id').value).toBe('initial-value');
        result.current('model-id', 'test-event', 'updated');
        expect(api.bus.getModel<TestModelState>('model-id').value).toBe('updated');
        result.current({ address: 'model-id', eventType: 'test-event', event: 'updated2'});
        expect(api.bus.getModel<TestModelState>('model-id').value).toBe('updated2');
    });
});
