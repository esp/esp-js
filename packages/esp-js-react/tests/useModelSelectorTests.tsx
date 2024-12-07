import 'jest';
import * as React from 'react';
import {act} from 'react';
import {modelSelectorOptions, useModelSelector} from '../src';
import {TestModel, TestModelImmutableState} from './testApi/testModel';
import {ViewMetadata} from './testApi/viewFactory';
import {routerAsserts} from './testApi/asserts';
import {testApi, TestApi} from './testApi/testApi';

type SelectedObject = { id: string, value: string };

describe('useModelSelector', () => {
    let api: TestApi;

    beforeEach(() => {
        api = testApi();
    });

    describe('Default API case', () => {
        const modelId = 'modelId';

        const View = () => {
            const valuesObj = useModelSelector<TestModelImmutableState, SelectedObject>(
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
           api.setupModelAndRender(modelId, View);
        });

        it('renders immutable model based on modelId found on context', () => {
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('updates are rendered', () => {
            act(() => {
                api.router.publishEvent(modelId, 'test-event', 'new-value');
            });
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('new-value');
        });
    });

    describe('modelId can be passed via selector', () => {
        const modelId = 'modelId';

        const View = () => {
            const values: string[] = useModelSelector<TestModelImmutableState, string[]>(
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
            api.setupTestModel(modelId);
            api.doRender(View, undefined);
        });

        it('renders correct model data', () => {
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });
    });

    describe('equalityFn is invoked to determine if changed should be propagated', () => {
        const modelId = 'modelId';

        const View = () => {
            const values = useModelSelector<TestModelImmutableState, SelectedObject>(
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
           api.setupModelAndRender(modelId, View);
        });

        it('renders initial model data', () => {
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('updates are ignored due to equalityFn', () => {
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value');
            act(() => {
                api.router.publishEvent(modelId, 'test-event', 'assume-no-change');
            });
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value'); // event data WAS NOT propagated
            act(() => {
                api.router.publishEvent(modelId, 'test-event', 'do-change');
            });
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('do-change'); // event data WAS propagated
        });
    });

    describe('selector internal caching is based on modelId', () => {
        const modelId1 = 'modelId1';
        const modelId2 = 'modelId2';

        const View = (props: {modelId: string}) => {
            const values = useModelSelector<TestModelImmutableState, SelectedObject>(
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
            api.setupTestModel(modelId1);
            api.doRender(View, modelId1);
        });

        it('selector subscribed to Router', () => {
            routerAsserts(api.router).subscriberCountIs(modelId1, 1);
        });

        it('unsubscribes when modelId changes', () => {
            api.doReRender(View, undefined);
            api.asserts.router.subscriberCountIs(modelId1, 0);
        });

        it('resubscribes to new model when modelId changes', () => {
            api.asserts.view
                .modelIdIs(modelId1)
                .valueIs('initial-value');
            api.doReRender(View, undefined);
            api.asserts.view
                .modelIdIs('')
                .valueIs('');
            api.setupTestModel(modelId2);
            api.doReRender(View, modelId2);
            api.asserts.view
                .modelIdIs(modelId2)
                .valueIs('initial-value');
            act(() => {
                api.router.publishEvent(modelId2, 'test-event', 'updated');
            });
            api.asserts.view
                .modelIdIs(modelId2)
                .valueIs('updated');
        });
    });

    describe('non immutable model cases #1 - selector receives then maps model subset', () => {
        const modelId = 'modelId';

        const View = () => {
            const values: string[] = useModelSelector<TestModel, string[]>(
                model => {
                    // here we're expecting to receive a TestModel, not testModelInstance[GetEspPolimerImmutableModelConsts.HandlerFunctionName]()
                    return [model.state.modelId, model.state.value];
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
           api.setupModelAndRender(modelId, View);
        });

        it('selector passes router root model to selector', () => {
            api.asserts.view
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
                <ViewMetadata modelId={model.state.modelId} modelValue={model.state.value} />
            );
        };

        beforeEach(() => {
           api.setupModelAndRender(modelId, View);
        });

        it('view renders correct data', () => {
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('initial-value');
        });

        it('Updates propagated', () => {
            act(() => {
                api.router.publishEvent(modelId, 'test-event', 'updated');
            });
            api.asserts.view
                .modelIdIs(modelId)
                .valueIs('updated');
        });
    });
});