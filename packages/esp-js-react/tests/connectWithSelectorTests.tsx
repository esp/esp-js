import 'jest';
import * as React from 'react';
import {act} from 'react';
import {render, RenderResult} from '@testing-library/react';
import {useModelSelector, EspModelContext, EspRouterContext} from '../src';
import {observeEvent, Router} from 'esp-js';
// import for extra asserts
import '@testing-library/jest-dom';

class TestModel {
    public value: string;

    constructor() {
        this.value = 'initial-value';
    }

    @observeEvent('test-event')
    _onTestEvent(ev: string) {
        this.value = ev;
    }
}

const MyComponent = () => {
    const modelValue = useModelSelector<TestModel, string>(
        model => model.value
    );
    return (
        <div>
            <span data-testid='valueDisplay'>{modelValue}</span>
        </div>
    );
};

describe('connectWithSelector', () => {
    let router: Router,
        testModel: TestModel,
        renderResult: RenderResult,
        testModelId = 'this-model-id';

    beforeEach(() => {
        router = new Router();
        testModel = new TestModel();
        router.addModel(testModelId, testModel);
        router.observeEventsOn(testModelId, testModel);
        renderResult = render((
            <EspRouterContext router={router}>
                <EspModelContext modelId={testModelId}>
                    <MyComponent />,
                </EspModelContext>
            </EspRouterContext>
        ));
    });

    it('component is rendered', () => {
        let testElement = renderResult.getByTestId('valueDisplay');
        expect(testElement).toHaveTextContent('initial-value');
    });

    it('model updates are rendered', () => {
        let testElement = renderResult.getByTestId('valueDisplay');
        expect(testElement).toHaveTextContent('initial-value');
        act(() => {
            router.publishEvent(testModelId, 'test-event', 'new-value');
        });
        expect(testElement).toHaveTextContent('new-value');
    });
});