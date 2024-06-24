import { Router} from 'esp-js';
import {TestStateObjectHandler} from './testApi/stateHandlers';
import {defaultModelFactory, TestImmutableModel} from './testApi/testModel';
import {Actor, ModelStoreAsserts} from './testApi/testApi';

describe('Model StoreTests', () => {
    let router: Router;
    let modelId: string;

    beforeEach(() => {
        router = new Router();
        modelId = 'modelId';
    });

    it('Event handler correct state for given model address', () => {

        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerForModelMap('modelMapState', '1', new TestStateObjectHandler(router))
            .withStateHandlerForModelMap('modelMapState', '2', new TestStateObjectHandler(router))
            .withStateHandlerForModelMap('modelMapState', '3', new TestStateObjectHandler(router))
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().modelMapState);
        // let actor = new Actor(modelId, router);

        router.publishEvent({modelId: 'modelId', modelPath: 'modelMapState://id-1'}, 'the-event', { data: 'the-data' });

        // asserts.entityCountIs(1);
        // asserts.expectedStatesToChange('id-1');

        asserts.state('id-1').normalEvents().eventCountIs(1);
    });
});