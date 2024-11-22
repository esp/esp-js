import 'jest';
import * as React from 'react';
import {
    connect,
    ConnectableComponent,
    ConnectableComponentProps,
    viewBinding,
    getEspReactRenderModel,
    PublishModelEventDelegate,
    RouterContext,
    EspRouterContext
} from '../src';
import {Router, observeEvent, utils} from 'esp-js';
import {render, RenderResult} from '@testing-library/react';

const getPropsAsDataAttributesWithMetadata = (props: any) => {
    const propsAsDataAttributes: {[key: string]: string} = Object.keys(props).reduce((result: any, key: string) => {
        let prop = props[key];
        // need to lower case data-* attributes else React throws a warning
        result[`data-${key.toLowerCase()}`] = utils.isString(prop)
            ? prop
            : typeof prop;
        return result;
    }, {});
    return propsAsDataAttributes;
};

class TestModelView1 extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <span data-testid='span-with-props-as-attributes' {...getPropsAsDataAttributesWithMetadata(this.props)} />
            <span data-testid='view-text'>View1</span>
        </div>;
    }
}

class TestModelView2 extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <div>
            <span data-testid='span-with-props-as-attributes'  {...getPropsAsDataAttributesWithMetadata(this.props)} />
            <span data-testid='view-text'>View2</span>
        </div>;
    }
}

class TestModelView3 extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <span>View3</span>;
    }
}

@viewBinding(TestModelView1)
@viewBinding(TestModelView3, 'alternative-view-context')
class TestModel {
    public value: string;

    constructor() {
        this.value = 'initial-value';
    }

    @observeEvent('test-event')
    _onTestEvent(ev) {
        this.value = ev;
    }
}

class TestModel2 extends TestModel {
    @getEspReactRenderModel()
    _getOtherState() {
        return {
            value: this.value,
            value2: this.value,
            value3: 'value-3'
        } as MappedModel;
    }
}

class TestModel3 extends TestModel {
    getEspReactRenderModel() {
        return {
            value: this.value,
            value2: this.value,
            value3: 'value-3.1'
        } as MappedModel;
    }
}

interface MappedModel {
    value: string;
    value2: string;
    value3: string;
}

interface TestOptions {
    useConnectFunction?: boolean;
    useMapModelToProps?: boolean;
    useCreatePublishEventProps?: boolean;
    useAlternativeViewContext?: boolean;
    passOtherProps?: boolean;
    useRenderModelSelectorDecorator?: boolean;
    useRenderModelSelectorFunction?: boolean;
}

describe('ConnectableComponent', () => {
    let router,
        testModel: TestModel,
        testModel2: TestModel,
        renderResult: RenderResult,
        connectableComponentProps: ConnectableComponentProps<TestModel>,
        mapModelToProps,
        createPublishEventProps,
        publishEventProps,
        userAlternativeViewContext,
        otherProps = {other1: 'other-value'};

    function createModel(options: TestOptions) {
        if (options.useRenderModelSelectorDecorator) {
            return new TestModel2();
        }
        if (options.useRenderModelSelectorFunction) {
            return new TestModel3();
        }
        return new TestModel();
    }

    function setup(options: TestOptions) {
        router = new Router();
        testModel = createModel(options);
        router.addModel('model-id', testModel);
        router.observeEventsOn('model-id', testModel);
        testModel2 = new TestModel();
        router.addModel('model-id2', testModel2);
        router.observeEventsOn('model-id2', testModel2);
        connectableComponentProps = {
            modelId: 'model-id'
        };
        if (options.useMapModelToProps) {
            mapModelToProps = (model: TestModel | MappedModel, publishEventProps2: any) => {
                return {
                    foo: model.value,
                    publishEventProps: publishEventProps2,
                    ...model
                };
            };
        }
        if (options.useCreatePublishEventProps) {
            publishEventProps = {
                publishEvent1: () => {
                }
            };
            createPublishEventProps = (publishEvent: PublishModelEventDelegate) => publishEventProps;
        }
        if (options.useAlternativeViewContext) {
            userAlternativeViewContext = 'alternative-view-context';
        }
        if (options.useConnectFunction) {
            const TestModelView2ConnectedComponent = connect(
                mapModelToProps,
                createPublishEventProps
            )(TestModelView2);
            renderResult = render(
                <RouterContext.Provider value={router} >
                    <TestModelView2ConnectedComponent {...otherProps}  {...connectableComponentProps}/>,
                </RouterContext.Provider>
            );
        } else {
            renderResult = render(
                <EspRouterContext router={router} >
                    <ConnectableComponent
                        {...connectableComponentProps}
                        mapModelToProps={mapModelToProps}
                        viewContext={userAlternativeViewContext}
                        {...otherProps}
                    />
                </EspRouterContext>
            );
        }
    }

    function publishAnEventToModel1() {
        router.publishEvent('model-id', 'test-event', 'the-event-value');
        expect(testModel.value).toEqual('the-event-value');
    }

    function publishAnEventToModel2() {
        router.publishEvent('model-id2', 'test-event', 'the-event-value2');
        expect(testModel2.value).toEqual('the-event-value2');
    }

    afterEach(() => {
        // console.log(connectableComponentWrapper.debug());
    });

    describe('ConnectableComponent via connect()', () => {
        beforeEach(() => {
            setup({useConnectFunction: true, useMapModelToProps: true, useCreatePublishEventProps: true});
        });

        const getSpanWithPropsAsAttributes = () => {
            return renderResult.getByTestId('span-with-props-as-attributes');
        };

        describe('Child view props', () => {
            it('passes mapped props', () => {
                let span = getSpanWithPropsAsAttributes();
                expect(span.getAttribute('data-foo')).toBe('initial-value');
            });

            // it('passes publishEventProps to props mapper', () => {
            //     let span = getSpanWithPropsAsAttributes();
            //     expect(span.getAttribute('publishEventProps')).toBe('function');
            // });
            //
            // it('passes model', () => {
            //     let props = getSpanWithPropsAsAttributes();
            //     expect(props.model).toBe(testModel);
            // });
            //
            // it('passes publishEventProps', () => {
            //     let props = getSpanWithPropsAsAttributes();
            //     expect(props.publishEvent1).toBeDefined();
            // });
            //
            // it('passes other props', () => {
            //     let props = getSpanWithPropsAsAttributes();
            //     expect(props.other1).toEqual('other-value');
            // });
        });

        // describe('View rendering', () => {
        //     it('Renders the view provided to connect', () => {
        //         expect(connectableComponentWrapper.containsMatchingElement(<TestModelView2/>)).toBeTruthy();
        //     });
        // });
    });
    //
    // describe('ConnectableComponent directly', () => {
    //
    //     const getSpanWithPropsAsAttributes = () => {
    //         return connectableComponentWrapper.childAt(0).props() as ConnectableComponentChildProps<TestModel>;
    //     };
    //
    //     describe('Child view props', () => {
    //         beforeEach(() => {
    //             setup({useConnectFunction: false});
    //         });
    //
    //         it('passes modelId', () => {
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.modelId).toEqual('model-id');
    //         });
    //
    //         it('passes router', () => {
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.router).toBe(router);
    //         });
    //
    //         it('passes model', () => {
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.model).toBe(testModel);
    //         });
    //
    //         it('passes other props', () => {
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.other1).toEqual('other-value');
    //         });
    //     });
    //
    //     describe('Re-renders', () => {
    //         beforeEach(() => {
    //             setup({useConnectFunction: false});
    //         });
    //
    //         it('Re-renders when model updates', () => {
    //             publishAnEventToModel1();
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.model.value).toBe('the-event-value');
    //         });
    //     });
    //
    //     describe('Model Subscription', () => {
    //         beforeEach(() => {
    //             setup({useConnectFunction: false});
    //         });
    //
    //         it('Re-subscribes to new model when modelId changes', () => {
    //             const newProps = {
    //                 ...connectableComponentWrapper.props(),
    //                 modelId: 'model-id2',
    //             };
    //             connectableComponentWrapper.setProps(newProps);
    //             publishAnEventToModel2();
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.foo).toBe('the-event-value2');
    //         });
    //     });
    //
    //     describe('Publish Event Context', () => {
    //         beforeEach(() => {
    //             setup({useConnectFunction: false});
    //         });
    //
    //         // Cant test hooks yet, will test using state below
    //         // https://github.com/enzymejs/enzyme/issues/2011
    //         xit('Can publish event via context', () => {
    //             const childViewContext = connectableComponentWrapper.context();
    //             let publishEvent: PublishModelEventDelegate = React.useContext(PublishModelEventContext);
    //             publishEvent('test-event', 'the-event-value');
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.foo).toBe('the-event-value');
    //         });
    //
    //         // Note this is a a best effort to test the context hook created via state
    //         it('publishEvent set', () => {
    //             const state = connectableComponentWrapper.state();
    //             state.publishEvent('test-event', 'the-event-value');
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.model.value).toBe('the-event-value');
    //         });
    //
    //         it('publishEvent recreated on modle change', () => {
    //             const newProps = {
    //                 ...connectableComponentWrapper.props(),
    //                 modelId: 'model-id2',
    //             };
    //             connectableComponentWrapper.setProps(newProps);
    //             const state = connectableComponentWrapper.state();
    //             state.publishEvent('test-event', 'the-event-value');
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.model.value).toBe('the-event-value');
    //             expect(testModel2.value).toBe('the-event-value');
    //         });
    //     });
    //
    //     describe('View rendering', () => {
    //         it('Renders the view found via @viewBinding', () => {
    //             setup({useConnectFunction: false});
    //             expect(connectableComponentWrapper.containsMatchingElement(<TestModelView1/>)).toBeTruthy();
    //         });
    //
    //         it('Renders alternative view found via @viewBinding', () => {
    //             setup({useConnectFunction: false, useAlternativeViewContext: true});
    //             expect(connectableComponentWrapper.containsMatchingElement(<TestModelView3/>)).toBeTruthy();
    //         });
    //     });
    //
    //     describe('Overriding model/state selector', () => {
    //         function testModelHasBeenReplacedWithMappedModel(expectedValue3) {
    //             let props = getSpanWithPropsAsAttributes();
    //             let mappedModel = props.model as any as MappedModel;
    //             expect(mappedModel.value2).toBe('initial-value');
    //             expect(mappedModel.value3).toBe(expectedValue3);
    //             publishAnEventToModel1();
    //             props = getSpanWithPropsAsAttributes();
    //             mappedModel = props.model as any as MappedModel;
    //             expect(mappedModel.value2).toBe('the-event-value');
    //         }
    //
    //         function testSwappedModelPassedToMapModelToPropsFunction(expectedValue3) {
    //             let props = getSpanWithPropsAsAttributes();
    //             expect(props.value2).toBe('initial-value');
    //             expect(props.value3).toBe(expectedValue3);
    //             publishAnEventToModel1();
    //             props = getSpanWithPropsAsAttributes();
    //             expect(props.value2).toBe('the-event-value');
    //         }
    //
    //         describe('using @stateToRenderSelector', () => {
    //             it('Swaps the model for that returned by the function decorated with a @stateToRenderSelector decorator', () => {
    //                 setup({useConnectFunction: false, useRenderModelSelectorDecorator: true});
    //                 testModelHasBeenReplacedWithMappedModel('value-3');
    //             });
    //
    //             it('passes the swapped model to mapModelToProps function', () => {
    //                 setup({useConnectFunction: false, useRenderModelSelectorDecorator: true, useMapModelToProps: true});
    //                 testSwappedModelPassedToMapModelToPropsFunction('value-3');
    //             });
    //         });
    //
    //         describe('using state to render function', () => {
    //             it('Swaps the model for that returned by the function decorated with a @stateToRenderSelector decorator', () => {
    //                 setup({useConnectFunction: false, useRenderModelSelectorFunction: true});
    //                 testModelHasBeenReplacedWithMappedModel('value-3.1');
    //             });
    //
    //             it('passes the swapped model to mapModelToProps function', () => {
    //                 setup({useConnectFunction: false, useRenderModelSelectorFunction: true, useMapModelToProps: true});
    //                 testSwappedModelPassedToMapModelToPropsFunction('value-3.1');
    //             });
    //         });
    //     });
    // });
});