import 'jest';
import * as React from 'react';
import {render, RenderResult} from '@testing-library/react';
import {connectWithSelector, defaultConnectEqualityFn, EspModelContext} from '../src';
import {observeEvent, Router} from 'esp-js';
// import for extra asserts
import '@testing-library/jest-dom';
import {act} from 'react';

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

const MyComponent = ({modelId}: { modelId: string }) => {
    const modelValue = connectWithSelector<TestModel>(
        model => model.value,
        modelId,
        defaultConnectEqualityFn,
        // (a, b) => {
        //     const e = a === b;
        //     return e;
        // }
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
        doRender();
    });

    const doRender = (rerender = false) => {
        const components = (
            <EspModelContext modelId={testModelId} router={router} >
                <MyComponent modelId={testModelId} />,
            </EspModelContext>
        );
        if (rerender) {
            renderResult.rerender(components);
        } else {
            renderResult = render(components);
        }
    };

    it('component is rendered', () => {
        let testElement = renderResult.getByTestId('valueDisplay');
        expect(testElement).toBeInTheDocument();
        expect(testElement).toHaveTextContent('initial-value');
    });

    it('model udpates are is rendered', () => {
        let testElement = renderResult.getByTestId('valueDisplay');
        expect(testElement).toHaveTextContent('initial-value');

        act(() => {
            router.publishEvent(testModelId, 'test-event', 'new-value');
        });

        // doRender(true);
        expect(testElement).toHaveTextContent('new-value');
    });
});