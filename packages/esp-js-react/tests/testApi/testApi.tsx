import {createTestModel, TestModelState} from './testModel';
import {EventBusSpy} from './eventBusSpy';
import {render, RenderResult} from '@testing-library/react';
import * as React from 'react';
import {EspModelContextProvider, EspEventBusContextProvider} from '../../src';
import {EventBusAsserts, eventBusAsserts, PropAsserts, propAsserts, ViewAsserts, viewAsserts} from './asserts';
import {isValidElement, ReactElement} from 'react';
import {TestPropStore, TestPropStoreContext} from './useStoreReceivedProps';

export type TestApi = {
    bus: EventBusSpy;
    propStore: TestPropStore;
    asserts: {
        bus: EventBusAsserts,
        view: ViewAsserts,
        props: PropAsserts,
    };
    setupModel<TModel>(modelId: string, model: TModel): TModel;
    setupTestModel(modelId: string): TestModelState;
    setupModelAndRender(modelId: string, Component: React.ComponentType): TestApi;
    doRender(Component: React.ComponentType, modelIdForContext?: string): TestApi
    doRender(Component: React.JSX.Element, modelIdForContext?: string): TestApi
    doReRender(Component: React.ComponentType, modelIdForContext?: string, nextProps?: any): TestApi;
    doReRender(Component: React.JSX.Element, modelIdForContext?: string, nextProps?: any): TestApi;
};

export const testApi = ()=> {
    let bus: EventBusSpy = new EventBusSpy();
    let renderResult: RenderResult;
    let propStore = new TestPropStore();
    return {
        bus,
        propStore,
        asserts: {
            get bus() {
                return eventBusAsserts(bus);
            },
            get view() {
                return viewAsserts(renderResult);
            },
            get props() {
                return propAsserts(propStore);
            }
        },
        setupModelAndRender(modelId: string, view: React.ComponentType) {
            this.setupTestModel(modelId);
            this.doRender(view, modelId);
            return this;
        },
        setupModel<TModel>(modelId: string, model: TModel): TModel {
            bus.storeBuilder<TModel>(modelId, model).build();
            return model;
        },
        setupTestModel(modelId: string): TestModelState {
            return createTestModel(bus, modelId);
        },
        doRender(ComponentOrElement: any, modelIdForContext?: string, nextProps?: any) {
            let element: React.JSX.Element;
            if (isValidElement(ComponentOrElement)) {
                element = ComponentOrElement;
            } else {
                element = <ComponentOrElement />;
            }
            let elementWithProps = React.cloneElement(element, nextProps);
            renderResult = render((
                <TestPropStoreContext.Provider value={propStore}>
                    <EspEventBusContextProvider bus={bus}>
                        <EspModelContextProvider modelId={modelIdForContext}>
                            {elementWithProps},
                        </EspModelContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            return this;
        },
        doReRender(ComponentOrElement: any, modelIdForContext?: string, nextProps?: any) {
            let element: React.JSX.Element;
            if (isValidElement(ComponentOrElement)) {
                element = ComponentOrElement;
            } else {
                element = <ComponentOrElement />;
            }
            let elementWithProps = React.cloneElement(element, nextProps);
            renderResult.rerender((
                <TestPropStoreContext.Provider value={propStore}>
                    <EspEventBusContextProvider bus={bus}>
                        <EspModelContextProvider modelId={modelIdForContext}>
                            {elementWithProps},
                        </EspModelContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            return this;
        }
    } as TestApi;
};
