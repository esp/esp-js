import {Router} from 'esp-js';
import {TestStateObjectHandler} from './testApi/stateHandlers';
import {defaultModelFactory, EventConst, TestImmutableModel} from './testApi/testModel';
import {ModelStoreAsserts} from './testApi/testApi';

describe('StateMap Tests', () => {
    let router: Router;
    let modelId: string;

    beforeEach(() => {
        router = new Router();
        modelId = 'modelId';
    });

    it('Can publish StateMap event to specific state handler', () => {
        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerObject('testStatMap', {modelPath: 'id-1', stateHandler: new TestStateObjectHandler(router, 'id-1')})
            .withStateHandlerObject('testStatMap', {modelPath: 'id-2', stateHandler: new TestStateObjectHandler(router, 'id-2')})
            .withStateHandlerObject('testStatMap', {modelPath: 'id-3', stateHandler: new TestStateObjectHandler(router, 'id-3')})
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().testStatMap);
        let state1Asserts = asserts.state('id-1').captureCurrentState();
        let state2Asserts = asserts.state('id-2').captureCurrentState();
        let state3Asserts = asserts.state('id-3').captureCurrentState();

        router.publishEvent({modelId: 'modelId', modelPath: 'id-1'}, EventConst.event1, {data: 'the-data1'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-2'}, EventConst.event1, {data: 'the-data2'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-3'}, EventConst.event1, {data: 'the-data3'});

        state1Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPath('id-1')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-1')
            .eventIs(0, e => e.data === 'the-data1');

        state2Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPath('id-2')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-2')
            .eventIs(0, e => e.data === 'the-data2');

        state3Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPath('id-3')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-3')
            .eventIs(0, e => e.data === 'the-data3');
    });

    // This test is very similar to the above however we have a single handler handling all events
    it('Can publish StateMap event shared state handler', () => {
        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerObject('testStatMap', new TestStateObjectHandler(router))
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().testStatMap);
        let state1Asserts = asserts.state('id-1').captureCurrentState();
        let state2Asserts = asserts.state('id-2').captureCurrentState();
        let state3Asserts = asserts.state('id-3').captureCurrentState();

        router.publishEvent({modelId: 'modelId', modelPath: 'id-1'}, EventConst.event1, {data: 'the-data1'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-2'}, EventConst.event1, {data: 'the-data2'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-3'}, EventConst.event1, {data: 'the-data3'});

        state1Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPathIsUndefined()
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-1')
            .eventIs(0, e => e.data === 'the-data1');

        state2Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPathIsUndefined()
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-2')
            .eventIs(0, e => e.data === 'the-data2');

        state3Asserts
            .stateInstanceHasChanged()
            .dispatchedEventsHadExpectedModelPathIsUndefined()
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventModelPath(0,'id-3')
            .eventIs(0, e => e.data === 'the-data3');
    });
});