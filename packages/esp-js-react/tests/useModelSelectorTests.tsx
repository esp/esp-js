import 'jest';
import * as React from 'react';
import {act} from 'react';
import {configure, render, RenderResult} from '@testing-library/react';
import {useModelSelector, EspModelContextProvider, EspRouterContextProvider, GetEspReactRenderModelConsts, modelSelectorOptions} from '../src';
import {observeEvent} from 'esp-js';
// import for extra asserts
import '@testing-library/jest-dom';
import {RouterSpy} from './routerSpy';

type TestModelImmutableStateState = { value: string, modelId: string };
configure({reactStrictMode: false});

class TestModel {

    private _internalState: TestModelImmutableStateState;

    constructor(modelId: string) {
        this._internalState = {
            value: 'initial-value',
            modelId: modelId,
        };
    }

    public get valueViaModelGetter() {
        return this._internalState.value;
    }

    public get modelIdViaModelGetter() {
        return this._internalState.modelId;
    }

    @observeEvent('test-event')
    _onTestEvent(ev: string) {
        // mimic some immutable logic that would be provided by a lib such as immer in a real app.
        this._internalState = {
            ...this._internalState,
            value: ev
        };
    }

    [GetEspReactRenderModelConsts.HandlerFunctionName]: () => TestModelImmutableStateState = () => {
        return this._internalState;
    };
}

const ViewMetadata = ({modelId, modelValue}: {modelId: string, modelValue: string}) => {
    return (
        <div>
            <span data-testid='modelIdDisplay'>{modelId}</span>
            <span data-testid='valueDisplay'>{modelValue}</span>
        </div>
    );
};

const viewAsserts = (renderResult: RenderResult) => {
    let valueElement = renderResult.getByTestId('valueDisplay');
    let idElement = renderResult.getByTestId('modelIdDisplay');

    expect(valueElement).toBeInTheDocument();
    expect(idElement).toBeInTheDocument();
    return {
        modelIdIs(expected: string) {
            expect(idElement).toHaveTextContent(expected);
            return this;
        },
        valueIs(expected: string) {
            expect(valueElement).toHaveTextContent(expected);
            return this;
        },
    };
};

const routerAsserts = (routerSpy: RouterSpy) => {
    return {
        subscriberCountIs(modelId: string, expectedCount: number) {
            expect(routerSpy.getSubscriberCount(modelId)).toEqual(expectedCount);
            return this;
        },
    };
};

type SelectedObject = { id: string, value: string };

describe('useModelSelector', () => {
    let router: RouterSpy,
        renderResult: RenderResult;

    beforeEach(() => {
        router = new RouterSpy();
    });

    function setupModel(modelId: string) {
        const testModel = new TestModel(modelId);
        router.addModel(modelId, testModel);
        router.observeEventsOn(modelId, testModel);
    }

    function doRender(Component: React.ComponentType, modelIdForContext: string) {
        renderResult = render((
            <EspRouterContextProvider router={router}>
                <EspModelContextProvider modelId={modelIdForContext}>
                    <Component/>,
                </EspModelContextProvider>
            </EspRouterContextProvider>
        ));
    }

    function doReRender(Component: React.ComponentType, modelIdForContext: string) {
        renderResult.rerender((
            <EspRouterContextProvider router={router}>
                <EspModelContextProvider modelId={modelIdForContext}>
                    <Component/>,
                </EspModelContextProvider>
            </EspRouterContextProvider>
        ));
    }

    describe('Default API case', () => {
        const modelId = 'modelId';

        const View = () => {
            const valuesObj = useModelSelector<TestModelImmutableStateState, SelectedObject>(
                model => {
                    return {id: model.modelId, value: model.value};
                },
            );
            if (!valuesObj) {
                return;
            }
            return (
                <ViewMetadata modelId={valuesObj.id} modelValue={valuesObj.value} />
            );
        };

        beforeEach(() => {
            setupModel(modelId);
            doRender(View, modelId);
        });

        it('renders immutable model based on modelId found on context', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('updates are rendered', () => {
            act(() => {
                router.publishEvent(modelId, 'test-event', 'new-value');
            });
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('new-value');
        });
    });

    describe('modelId can be passed via selector', () => {
        const modelId = 'modelId';

        const View = () => {
            const values: string[] = useModelSelector<TestModelImmutableStateState, string[]>(
                model => [model.modelId, model.value],
                modelSelectorOptions().setModelId(modelId)
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values[0]} modelValue={values[1]} />
            );
        };

        beforeEach(() => {
            setupModel(modelId);
            doRender(View, undefined);
        });

        it('renders correct model data', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });
    });

    describe('equalityFn is invoked to determine if changed should be propagated', () => {
        const modelId = 'modelId';

        const View = () => {
            const values = useModelSelector<TestModelImmutableStateState, SelectedObject>(
                model => ({id: model.modelId, value: model.value}),
                modelSelectorOptions<SelectedObject>()
                    .setEqualityFn((a, b) => {
                        if (!a) {
                            return false; // first time
                        }
                        // delegate to model, set via the test, to see if we're 'equal'
                        // If this returns true, useModelSelector internally assume the last snapshot is the same thus doesn't propagate the last snapshot.
                        return b.value === 'assume-no-change';
                    })
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values.id} modelValue={values.value} />
            );
        };

        beforeEach(() => {
            setupModel(modelId);
            doRender(View, modelId);
        });

        it('renders initial model data', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('updates are ignored due to equalityFn', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
            act(() => {
                router.publishEvent(modelId, 'test-event', 'assume-no-change');
            });
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value'); // event data WAS NOT propagated
            act(() => {
                router.publishEvent(modelId, 'test-event', 'do-change');
            });
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('do-change'); // event data WAS propagated
        });
    });

    describe('selector internal caching is based on modelId', () => {
        const modelId1 = 'modelId1';
        const modelId2 = 'modelId2';

        const View = (props: {modelId: string}) => {
            const values = useModelSelector<TestModelImmutableStateState, SelectedObject>(
                model => ({id: model.modelId, value: model.value}),
                modelSelectorOptions().setModelId(props.modelId)
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values.id} modelValue={values.value} />
            );
        };

        beforeEach(() => {
            setupModel(modelId1);
            doRender(View, modelId1);
        });

        it('selector subscribed to Router', () => {
            routerAsserts(router).subscriberCountIs(modelId1, 1);
        });

        it('unsubscribes when modelId changes', () => {
            doReRender(View, undefined);
            routerAsserts(router).subscriberCountIs(modelId1, 0);
        });

        it('resubscribes to new model when modelId changes', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId1)
                .valueIs('initial-value');
            doReRender(View, undefined);
            viewAsserts(renderResult)
                .modelIdIs('')
                .valueIs('');
            setupModel(modelId2);
            doReRender(View, modelId2);
            viewAsserts(renderResult)
                .modelIdIs(modelId2)
                .valueIs('initial-value');
            act(() => {
                router.publishEvent(modelId2, 'test-event', 'updated');
            });
            viewAsserts(renderResult)
                .modelIdIs(modelId2)
                .valueIs('updated');
        });
    });

    describe('non immutable model cases #1 - selector receives then maps model subset', () => {
        const modelId = 'modelId';

        const View = () => {
            const values: string[] = useModelSelector<TestModel, string[]>(
                model => {
                    // here we're expecting to receive a TestModel, not testModelInstance[GetEspReactRenderModelConsts.HandlerFunctionName]()
                    return [model.modelIdViaModelGetter, model.valueViaModelGetter];
                },
                modelSelectorOptions().setTryPreSelectPolimerImmutableModel(false)
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values[0]} modelValue={values[1]} />
            );
        };

        beforeEach(() => {
            setupModel(modelId);
            doRender(View, modelId);
        });

        it('selector passes router root model to selector', () => {
            // Not much to test here, it's really in the View logic for this case.
            // If the below passes, it means the selector was given the root ESP model.
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });
    });

    describe('non immutable model cases - selector maps root model', () => {
        const modelId = 'modelId';

        const View = () => {
            const model: TestModel = useModelSelector<TestModel, TestModel>(
                m => m,
                modelSelectorOptions().setTryPreSelectPolimerImmutableModel(false)
            );
            if (!model) {
                return;
            }
            return (
                <ViewMetadata modelId={model.modelIdViaModelGetter} modelValue={model.valueViaModelGetter} />
            );
        };

        beforeEach(() => {
            setupModel(modelId);
            doRender(View, modelId);
        });

        it('view renders correct data', () => {
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('Updates propagated', () => {
            act(() => {
                router.publishEvent(modelId, 'test-event', 'updated');
            });
            viewAsserts(renderResult)
                .modelIdIs(modelId)
                .valueIs('updated');
        });
    });
});