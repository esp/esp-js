import {createTestModel, TestModelState} from './testModel';
import {EventBusSpy} from './eventBusSpy';
import {render, RenderResult} from '@testing-library/react';
import * as React from 'react';
import {EspStoreContextProvider, EspEventBusContextProvider} from '../../src';
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
    setupModel<TModel>(storeId: string, model: TModel): TModel;
    setupTestModel(storeId: string): TestModelState;
    setupModelAndRender(storeId: string, Component: React.ComponentType): TestApi;
    doRender(Component: React.ComponentType, storeIdForContext?: string): TestApi
    doRender(Component: React.JSX.Element, storeIdForContext?: string): TestApi
    doReRender(Component: React.ComponentType, storeIdForContext?: string, nextProps?: any): TestApi;
    doReRender(Component: React.JSX.Element, storeIdForContext?: string, nextProps?: any): TestApi;
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
        setupModelAndRender(storeId: string, view: React.ComponentType) {
            this.setupTestModel(storeId);
            this.doRender(view, storeId);
            return this;
        },
        setupModel<TModel>(storeId: string, model: TModel): TModel {
            bus.storeBuilder<TModel>(storeId, model).build();
            return model;
        },
        setupTestModel(storeId: string): TestModelState {
            return createTestModel(bus, storeId);
        },
        doRender(ComponentOrElement: any, storeIdForContext?: string, nextProps?: any) {
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
                        <EspStoreContextProvider storeId={storeIdForContext}>
                            {elementWithProps},
                        </EspStoreContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            return this;
        },
        doReRender(ComponentOrElement: any, storeIdForContext?: string, nextProps?: any) {
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
                        <EspStoreContextProvider storeId={storeIdForContext}>
                            {elementWithProps},
                        </EspStoreContextProvider>
                    </EspEventBusContextProvider>
                </TestPropStoreContext.Provider>
            ));
            return this;
        }
    } as TestApi;
};
