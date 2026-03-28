import * as React from 'react';
import {act} from 'react';
import {
    ConnectableComponent,
    ConnectableComponentProps,
    PublishStoreEventDelegate,
    MapModelToProps,
    CreatePublishEventProps,
} from '../src';
import {testApi, TestApi} from './testApi/testApi';
import {immerable} from 'immer';
import {viewFactory} from './testApi/viewFactory';

interface TestModelState {
    value: string;
    value2: string;
    value3: string;
    foo: string;
}

class TestModel {
    [immerable] = true;
    value: string = 'initial-value';
    value2: string = undefined;
    value3: string = undefined;
    foo: string = undefined;
}

class TestModel2 extends TestModel {
    value2: string = 'initial-value';
    value3: string = 'value-3';
    foo: string = 'the-foo';
}

interface ConnectedComponentElementCreationProperties {
    storeId: string;
    useMapModelToProps?: boolean;
    useCreatePublishEventProps?: boolean;
    passOtherProps?: boolean;
}

describe('ConnectableComponentTests', () => {
    let api: TestApi,
        testModel: TestModel,
        testModel2: TestModel2;

    beforeEach(() => {
        api = testApi();
        testModel = new TestModel();
        testModel2 = new TestModel2();
        api.bus.storeBuilder<TestModel>('model-id1', testModel)
            .withEventHandler('test-event', (draft, ev: string) => { draft.value = ev; })
            .build();
        api.bus.storeBuilder<TestModel2>('model-id2', testModel2)
            .withEventHandler('test-event', (draft, ev: string) => { draft.value = ev; })
            .build();
    });

    const createConnectedComponentElement = (options: ConnectedComponentElementCreationProperties): React.JSX.Element => {
        // Refactor note:
        // These tests were ported from some very old Enzime based tests.
        // They have been cleaned up quite a bit.
        // The next step in the cleanup would be to largely eliminate the option parameter.
        // It makes sense to have a function that returns the thing to render,
        // however, having an 'options' object just binds/funnels all the tests into one confusing API.
        // It'd be best to take a Partial<ConnectableComponentProps> and have more localized `beforeEach` calls invoke function this using new structure.
        let connectableComponentProps: ConnectableComponentProps<TestModel> = {
            storeId: options.storeId
        };
        let mapModelToProps: MapModelToProps<any, any, any>;
        let createPublishEventProps: CreatePublishEventProps<any>;
        const otherProps = {other1: 'other-value'};
        let publishEventProps: { publishEvent1: () => void };
        if (options.useMapModelToProps) {
            mapModelToProps = (model: TestModel, publishEventProps2: any) => {
                return {
                    ...model,
                    foo: model.value,
                    publishEventPropsPassedMapModelToProps: publishEventProps2 && typeof publishEventProps2.publishEvent1 === 'function',
                };
            };
        }
        if (options.useCreatePublishEventProps) {
            publishEventProps = {
                publishEvent1: () => {
                }
            };
            createPublishEventProps = (publishEvent: PublishStoreEventDelegate) => publishEventProps;
        }
        let viewElement: React.JSX.Element = (
            <ConnectableComponent
                {...connectableComponentProps}
                view={viewFactory('View1')}
                mapModelToProps={mapModelToProps}
                {...otherProps}
            />
        );
        return viewElement;
    };

    const publishTestEvent = (storeId: string, eventData: string) => {
        act(() => {
            api.bus.publishEvent(storeId, 'test-event', eventData);
        });
    };

    describe('ConnectableComponent', () => {

        describe('Child view props', () => {
            beforeEach(() => {
                let elementCreationProperties: ConnectedComponentElementCreationProperties = {
                    storeId: 'model-id1',
                    useConnectFunction: false
                };
                api.doRender(
                    createConnectedComponentElement(elementCreationProperties),
                    elementCreationProperties.storeId
                );
            });

            it('passes storeId', () => {
                api.asserts.props
                    .propAtIndex(
                        0,
                        props => {
                            expect(props.storeId).toBe('model-id1');
                        }
                    );
            });

            it('passes bus', () => {
                api.asserts.props
                    .propAtIndex(
                        0,
                        props => {
                            expect(props.bus).toBe(api.bus);
                        }
                    );
            });

            it('passes model', () => {
                api.asserts.props
                    .propAtIndex(
                        0,
                        props => {
                            expect(props.model).toBeDefined();
                            expect(props.model instanceof TestModel).toBeTruthy();
                        }
                    );
            });

            it('passes other props', () => {
                api.asserts.props
                    .propAtIndex(
                        0,
                        props => {
                            expect(props.other1).toBeDefined();
                            expect(props.other1).toBe('other-value');
                        }
                    );
            });
        });

        it('arbitrary props are passed down to the child', () => {
            api.doRender(
                (
                    <ConnectableComponent view={viewFactory('View1')} className={'foo-bar'} />
                ),
                'model-id1'
            );
            api.asserts.props
                .receivedPropCountIs(1)
                .propAtIndex(0, props => {
                    expect(props.className).toBe('foo-bar');
                });
        });

        describe('Re-renders', () => {
            beforeEach(() => {
                let elementCreationProperties: ConnectedComponentElementCreationProperties = {
                    storeId: 'model-id1',
                    useConnectFunction: false,
                };
                api.doRender(
                    createConnectedComponentElement(elementCreationProperties),
                    elementCreationProperties.storeId
                );
            });

            it('Re-renders when model updates', () => {
                publishTestEvent( 'model-id1', 'the-event-value');
                api.asserts.props
                    .receivedPropCountIs(2)
                    .propAtIndex(
                        1,
                        props => {
                            expect(props.model).toBeDefined();
                            expect(props.model.value).toBe('the-event-value');
                        }
                    );
            });
        });

        describe('Model Subscription - storeId source', () => {
            it('subscribes to storeId via props', () => {
                api.doRender(
                    (
                        <ConnectableComponent view={viewFactory('View1')} storeId={'model-id1'} />
                    )
                );
                api.asserts.props
                    .receivedPropCountIs(1)
                    .propAtIndexHasStoreId(0, 'model-id1');
            });

            it('subscribes to storeId via context', () => {
                api.doRender(
                    (
                        <ConnectableComponent view={viewFactory('View1')} />
                    ),
                    'model-id1'
                );
                api.asserts.props
                    .receivedPropCountIs(1)
                    .propAtIndexHasStoreId(0, 'model-id1');
            });
        });

        describe('Model Subscription - when storeId changes', () => {
            beforeEach(() => {
                let elementCreationProperties: ConnectedComponentElementCreationProperties = {
                    storeId: 'model-id1',
                    useConnectFunction: false,
                    useMapModelToProps: true
                };
                api.doRender(
                    createConnectedComponentElement(elementCreationProperties),
                    elementCreationProperties.storeId
                );
            });

            it('Re-subscribes to new model when storeId changes', () => {
                api.asserts.props
                    .receivedPropCountIs(1)
                    .propAtIndexHasStoreId(0,'model-id1');
                const element = createConnectedComponentElement({storeId: 'model-id2', useConnectFunction: false, useMapModelToProps: true});
                api.doReRender(element, 'model-id2');
                api.asserts.props
                    .receivedPropCountIs(2)
                    .propAtIndexHasStoreId(1,'model-id2');
                publishTestEvent( 'model-id2', 'the-event-value2');
                api.asserts.props
                    .receivedPropCountIs(3)
                    .propAtIndexHasStoreId(2,'model-id2')
                    .propAtIndex(
                        2,
                        props => {
                            expect(props.model.value).toBe('the-event-value2');
                        }
                    );
            });
        });

        describe('View rendering', () => {
            it('re-renders the view when the model changes', () => {
                api.doRender(
                    (
                        <ConnectableComponent view={viewFactory('View1')} />
                    ),
                    'model-id1'
                );
                api.asserts.view.viewNameElementTextIs('View1');
                api.asserts.props.receivedPropCountIs(1);
                act(() => {
                    api.bus.publishEvent('model-id1', 'test-event', 'changed-value');
                });
                api.asserts.props
                    .receivedPropCountIs(2)
                    .propAtIndex(1, props => {
                        expect(props.model.value).toBe('changed-value');
                    });
            });

            it('can pass view via prop', () => {
                const View = viewFactory('MyPropView');
                api.doRender(
                    (
                        <ConnectableComponent view={View} />
                    ),
                    'model-id1'
                );
                api.asserts.view.viewNameElementTextIs('MyPropView');
            });
        });

    });
});
