import 'jest';
import * as React from 'react';
import * as PropTypes from 'prop-types';
import {configure, mount, ReactWrapper} from 'enzyme';
import  ReactSixteenAdapter = require('enzyme-adapter-react-16');
import {ConnectableComponent, ConnectableComponentProps, viewBinding, connect, getEspReactRenderModel} from '../src';
import {Router} from 'esp-js';
import {observeEvent} from 'esp-js/src/decorators/observeEvent';
import {ConnectableComponentChildProps, PublishEvent} from '../src/connectableComponent';

configure({adapter: new ReactSixteenAdapter()});

class TestModelView1 extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <span>View1</span>;
    }
}

class TestModelView2 extends React.Component {
    constructor(props) {
        super(props);
    }

    render() {
        return <span>View2</span>;
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
        connectableComponentWrapper: ReactWrapper<ConnectableComponentProps<TestModel>, {}, ConnectableComponent<TestModel>>,
        connectableComponentProps: ConnectableComponentProps<TestModel>,
        mapModelToProps,
        createPublishEventProps,
        publishEventProps,
        userAlternativeViewContext,
        otherProps = { other1: 'other-value' };

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
        connectableComponentProps = {
            modelId: 'model-id'
        };
        if (options.useMapModelToProps) {
            mapModelToProps = (model: TestModel | MappedModel, publishEventProps: any) => {
                return {
                    foo: model.value,
                    publishEventProps,
                    ...model
                };
            };
        }
        if (options.useCreatePublishEventProps) {
            publishEventProps = {
                publishEvent1: () => {
                }
            };
            createPublishEventProps = (publishEvent: PublishEvent) => publishEventProps;
        }
        if (options.useAlternativeViewContext) {
            userAlternativeViewContext = 'alternative-view-context';
        }
        if (options.useConnectFunction) {
            const HotView2 = connect(
                mapModelToProps,
                createPublishEventProps
            )(TestModelView2);
            connectableComponentWrapper = mount(
                <HotView2 {...otherProps}/>,
                {context: {router}, childContextTypes: {router: PropTypes.instanceOf(Router)}}
            );
            connectableComponentWrapper.setProps(connectableComponentProps);
        } else {
            connectableComponentWrapper = mount(
                <ConnectableComponent
                    {...connectableComponentProps}
                    mapModelToProps={mapModelToProps}
                    viewContext={userAlternativeViewContext}
                    {...otherProps}
                />,
                {context: {router}, childContextTypes: {router: PropTypes.instanceOf(Router)}}
            );
        }
    }

    function publishAnEvent() {
        router.publishEvent('model-id', 'test-event', 'the-event-value');
        expect(testModel.value).toEqual('the-event-value');
        connectableComponentWrapper.update();
    }

    afterEach(() => {
       // console.log(connectableComponentWrapper.debug());
    });

    describe('ConnectableComponent via connect()', () => {
        beforeEach(() => {
            setup({useConnectFunction: true, useMapModelToProps: true, useCreatePublishEventProps: true});
        });

        const getChidViewProps = () => {
            return connectableComponentWrapper.childAt(0).childAt(0).props() as ConnectableComponentChildProps<TestModel>;
        };

        describe('Child view props', () => {
            it('passes mapped props', () => {
                let props = getChidViewProps();
                expect(props.foo).toEqual('initial-value');
            });

            it('passes publishEventProps to props mapper', () => {
                let props = getChidViewProps();
                expect(props.publishEventProps).toBe(publishEventProps);
            });

            it('passes model', () => {
                let props = getChidViewProps();
                expect(props.model).toBe(testModel);
            });

            it('passes publishEventProps', () => {
                let props = getChidViewProps();
                expect(props.publishEvent1).toBeDefined();
            });

            it('passes other props', () => {
                let props = getChidViewProps();
                expect(props.other1).toEqual('other-value');
            });
        });

        describe('View rendering', () => {
            it('Renders the view provided to connect', () => {
                expect(connectableComponentWrapper.containsMatchingElement(<TestModelView2/>)).toBeTruthy();
            });
        });
    });

    describe('ConnectableComponent directly', () => {

        const getChidViewProps = () => {
            return connectableComponentWrapper.childAt(0).props() as ConnectableComponentChildProps<TestModel>;
        };

        describe('Child view props', () => {
            beforeEach(() => {
                setup({useConnectFunction: false});
            });

            it('passes modelId', () => {
                let props = getChidViewProps();
                expect(props.modelId).toEqual('model-id');
            });

            it('passes router', () => {
                let props = getChidViewProps();
                expect(props.router).toBe(router);
            });

            it('passes model', () => {
                let props = getChidViewProps();
                expect(props.model).toBe(testModel);
            });

            it('passes other props', () => {
                let props = getChidViewProps();
                expect(props.other1).toEqual('other-value');
            });
        });

        describe('Re-renders', () => {
            beforeEach(() => {
                setup({useConnectFunction: false});
            });

            it('Re-renders when model updates', () => {
                publishAnEvent();
                let props = getChidViewProps();
                expect(props.foo).toBe('the-event-value');
            });
        });

        describe('View rendering', () => {
            it('Renders the view found via @viewBinding', () => {
                setup({useConnectFunction: false});
                expect(connectableComponentWrapper.containsMatchingElement(<TestModelView1/>)).toBeTruthy();
            });

            it('Renders alternative view found via @viewBinding', () => {
                setup({useConnectFunction: false, useAlternativeViewContext: true});
                expect(connectableComponentWrapper.containsMatchingElement(<TestModelView3/>)).toBeTruthy();
            });
        });

        describe('Overriding model/state selector', () => {
            function testModelHasBeenReplacedWithMappedModel(expectedValue3) {
                let props = getChidViewProps();
                let mappedModel = props.model as any as MappedModel;
                expect(mappedModel.value2).toBe('initial-value');
                expect(mappedModel.value3).toBe(expectedValue3);
                publishAnEvent();
                props = getChidViewProps();
                mappedModel = props.model as any as MappedModel;
                expect(mappedModel.value2).toBe('the-event-value');
            }

            function testSwappedModelPassedToMapModelToPropsFunction(expectedValue3) {
                let props = getChidViewProps();
                expect(props.value2).toBe('initial-value');
                expect(props.value3).toBe(expectedValue3);
                publishAnEvent();
                props = getChidViewProps();
                expect(props.value2).toBe('the-event-value');
            }

            describe('using @stateToRenderSelector', () => {
                it('Swaps the model for that returned by the function decorated with a @stateToRenderSelector decorator', () => {
                    setup({useConnectFunction: false, useRenderModelSelectorDecorator: true});
                    testModelHasBeenReplacedWithMappedModel('value-3');
                });

                it('passes the swapped model to mapModelToProps function', () => {
                    setup({useConnectFunction: false, useRenderModelSelectorDecorator: true, useMapModelToProps: true});
                    testSwappedModelPassedToMapModelToPropsFunction('value-3');
                });
            });

            describe('using state to render function', () => {
                it('Swaps the model for that returned by the function decorated with a @stateToRenderSelector decorator', () => {
                    setup({useConnectFunction: false, useRenderModelSelectorFunction: true});
                    testModelHasBeenReplacedWithMappedModel('value-3.1');
                });

                it('passes the swapped model to mapModelToProps function', () => {
                    setup({useConnectFunction: false, useRenderModelSelectorFunction: true, useMapModelToProps: true});
                    testSwappedModelPassedToMapModelToPropsFunction('value-3.1');
                });
            });
        });
    });
});