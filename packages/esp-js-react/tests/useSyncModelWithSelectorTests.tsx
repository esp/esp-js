import * as React from 'react';
import {act} from 'react';
import {EspStoreContextProvider, EspEventBusContextProvider, syncModelWithSelectorOptions, useSyncModelWithSelector} from '../src';
import {TestModelState} from './testApi/testModel';
import {viewFactory, ViewMetadata} from './testApi/viewFactory';
import {eventBusAsserts} from './testApi/asserts';
import {testApi, TestApi} from './testApi/testApi';
import {TestPropStoreContext} from './testApi/useStoreReceivedProps';

type SelectedObject = { id: string, value: string };

describe('useSyncModelWithSelector', () => {
    let api: TestApi;

    beforeEach(() => {
        api = testApi();
    });

    describe('Default API case', () => {
        const storeId = 'modelId';

        const View = () => {
            const valuesObj = useSyncModelWithSelector<TestModelState, SelectedObject>(
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
           api.setupModelAndRender(storeId, View);
        });

        it('renders immutable model based on storeId found on context', () => {
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('initial-value');
        });

        it('updates are rendered', () => {
            act(() => {
                api.bus.publishEvent(storeId, 'test-event', 'new-value');
            });
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('new-value');
        });
    });

    describe('storeId can be passed via selector', () => {
        const storeId = 'modelId';

        const View = () => {
            const values: string[] = useSyncModelWithSelector<TestModelState, string[]>(
                model => [model.modelId, model.value],
                syncModelWithSelectorOptions().setStoreId(storeId)
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values[0]} modelValue={values[1]} />
            );
        };

        beforeEach(() => {
            api.setupTestModel(storeId);
            api.doRender(View, undefined);
        });

        it('renders correct model data', () => {
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('initial-value');
        });
    });

    describe('equalityFn is invoked to determine if changed should be propagated', () => {
        const storeId = 'modelId';

        const View = () => {
            const values = useSyncModelWithSelector<TestModelState, SelectedObject>(
                model => ({id: model.modelId, value: model.value}),
                syncModelWithSelectorOptions<SelectedObject>()
                    .setEqualityFn((a, b) => {
                        if (!a) {
                            return false; // first time
                        }
                        // delegate to model, set via the test, to see if we're 'equal'
                        // If this returns true, useSyncModelWithSelector internally assume the last snapshot is the same thus doesn't propagate the last snapshot.
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
           api.setupModelAndRender(storeId, View);
        });

        it('renders initial model data', () => {
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('initial-value');
        });

        it('updates are ignored due to equalityFn', () => {
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('initial-value');
            act(() => {
                api.bus.publishEvent(storeId, 'test-event', 'assume-no-change');
            });
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('initial-value'); // event data WAS NOT propagated
            act(() => {
                api.bus.publishEvent(storeId, 'test-event', 'do-change');
            });
            api.asserts.view
                .storeIdIs(storeId)
                .valueIs('do-change'); // event data WAS propagated
        });
    });

    describe('selector internal caching is based on storeId', () => {
        const storeId1 = 'modelId1';
        const storeId2 = 'modelId2';

        const View = (props: {storeId: string}) => {
            const values = useSyncModelWithSelector<TestModelState, SelectedObject>(
                model => ({id: model.modelId, value: model.value}),
                syncModelWithSelectorOptions().setStoreId(props.storeId)
            );
            if (!values) {
                return;
            }
            return (
                <ViewMetadata modelId={values.id} modelValue={values.value} />
            );
        };

        beforeEach(() => {
            api.setupTestModel(storeId1);
            api.doRender(View, storeId1);
        });

        it('selector subscribed to EventBus', () => {
            eventBusAsserts(api.bus).subscriberCountIs(storeId1, 1);
        });

        it('unsubscribes when storeId changes', () => {
            api.doReRender(View, undefined);
            api.asserts.bus.subscriberCountIs(storeId1, 0);
        });

        it('resubscribes to new model when storeId changes', () => {
            api.asserts.view
                .storeIdIs(storeId1)
                .valueIs('initial-value');
            api.doReRender(View, undefined);
            api.asserts.view
                .modelIdIsNotInDom()
                .valueIsNotInDom();
            api.setupTestModel(storeId2);
            api.doReRender(View, storeId2);
            api.asserts.view
                .storeIdIs(storeId2)
                .valueIs('initial-value');
            act(() => {
                api.bus.publishEvent(storeId2, 'test-event', 'updated');
            });
            api.asserts.view
                .storeIdIs(storeId2)
                .valueIs('updated');
        });
    });

    describe('noop argument edge cases', () => {
        const View = viewFactory('View1');

        it('falsey bus', () => {
            api.doRender((
                <TestPropStoreContext.Provider value={api.propStore}>
                    <EspEventBusContextProvider bus={undefined}>
                        <EspStoreContextProvider storeId={'some-modelId'}>
                            <View  />,
                        </EspStoreContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            api.asserts.props
                .receivedPropCountIs(1)
                .propAtIndexHasStoreId(0, undefined)
                .propAtIndex(0, props => {
                    expect(props.storeId).not.toBeDefined();
                    expect(props.value).not.toBeDefined();
                });
        });

        it('falsey storeId', () => {
            api.doRender((
                <TestPropStoreContext.Provider value={api.propStore}>
                    <EspEventBusContextProvider bus={api.bus}>
                        <EspStoreContextProvider storeId={undefined}>
                            <View  />,
                        </EspStoreContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            api.asserts.props
                .receivedPropCountIs(1)
                .propAtIndexHasStoreId(0, undefined)
                .propAtIndex(0, props => {
                    expect(props.storeId).not.toBeDefined();
                    expect(props.value).not.toBeDefined();
                });
        });
    });

    describe('argument checking', () => {
        it('throws if selector incorrect', () => {
            expect(() => {
                useSyncModelWithSelector(null, syncModelWithSelectorOptions());
            }).toThrow(new Error('You must pass a selector function to useSyncModelWithSelector'));
            expect(() => {
                useSyncModelWithSelector(undefined, syncModelWithSelectorOptions());
            }).toThrow(new Error('You must pass a selector function to useSyncModelWithSelector'));
            expect(() => {
                const x: any = {};
                useSyncModelWithSelector(x, syncModelWithSelectorOptions());
            }).toThrow(new Error('You must pass a selector function to useSyncModelWithSelector'));
        });
        it('throws if options incorrect', () => {
            expect(() => {
                useSyncModelWithSelector((m) => m, null);
            }).toThrow(new Error('You must provide options when using useSyncModelWithSelector'));
            expect(() => {
                useSyncModelWithSelector((m) => m, syncModelWithSelectorOptions().setEqualityFn(null));
            }).toThrow(new Error('You must provide an equalityFn when using useSyncModelWithSelector'));
            expect(() => {
                useSyncModelWithSelector(
                    (m) => m,
                    {
                        storeId: '',
                        equalityFn: null,
                 });
            }).toThrow(new Error('You must provide an equalityFn when using useSyncModelWithSelector'));
        });
    });
});
