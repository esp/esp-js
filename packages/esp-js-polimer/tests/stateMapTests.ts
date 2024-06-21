import {Router} from 'esp-js';
import {TestStateObjectHandler} from './testApi/stateHandlers';
import {defaultModelFactory, EventConst, TestImmutableModel} from './testApi/testModel';
import {ModelStoreAsserts} from './testApi/testApi';
import {StateMap} from '../src';

describe('Model StoreTests', () => {
    let router: Router;
    let modelId: string;

    beforeEach(() => {
        router = new Router();
        modelId = 'modelId';
    });

    it.only('Can publish StateMap event to specific state handler', () => {

        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerObject('testStatMap', {modelPath: 'id-1', stateHandler: new TestStateObjectHandler(router, 'id-1')})
            .withStateHandlerObject('testStatMap', { modelPath: 'id-2', stateHandler: new TestStateObjectHandler(router, 'id-2') })
            .withStateHandlerObject('testStatMap', { modelPath: 'id-3', stateHandler: new TestStateObjectHandler(router, 'id-3') })
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().testStatMap);
        // let actor = new Actor(modelId, router);

        router.publishEvent({modelId: 'modelId', modelPath: 'id-1'}, EventConst.event1, {data: 'the-data1'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-2'}, EventConst.event1, {data: 'the-data2'});
        router.publishEvent({modelId: 'modelId', modelPath: 'id-3'}, EventConst.event1, {data: 'the-data3'});

        // asserts.entityCountIs(1);
        // asserts.expectedStatesToChange('id-1');

        asserts
            .state('id-1')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventWasProcessedByHandlerWithSpecificModelPath(0, 'id-1')
            .eventIs(0, e => e.data === 'the-data1');

        asserts
            .state('id-2')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventWasProcessedByHandlerWithSpecificModelPath(0, 'id-2')
            .eventIs(0, e => e.data === 'the-data2');

        asserts
            .state('id-3')
            .normalEvents()
            .eventCountIs(1)
            .eventTypeIs(0, EventConst.event1)
            .eventWasProcessedByHandlerWithSpecificModelPath(0, 'id-3')
            .eventIs(0, e => e.data === 'the-data3');
    });

    it('Can publish StateMap event shared state handler', () => {

        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerObject('testStatMap', new TestStateObjectHandler(router))
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().testStatMap);
        // let actor = new Actor(modelId, router);

        router.publishEvent({modelId: 'modelId', modelPath: 'id-1'}, 'the-event', {data: 'the-data'});
        // router.publishEvent({modelId: 'modelId', modelPath: 'id-2'}, 'the-event', { data: 'the-data' });
        // router.publishEvent({modelId: 'modelId', modelPath: 'id-3'}, 'the-event', { data: 'the-data' });

        // asserts.entityCountIs(1);
        // asserts.expectedStatesToChange('id-1');

        asserts.state('id-1').normalEvents().eventCountIs(1);
        // asserts.state('id-2').normalEvents().eventCountIs(1);
        // asserts.state('id-3').normalEvents().eventCountIs(1);
    });
});