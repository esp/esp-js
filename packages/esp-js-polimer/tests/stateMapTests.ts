import { Router} from 'esp-js';
import {TestStateObjectHandler} from './testApi/stateHandlers';
import {defaultModelFactory, TestImmutableModel} from './testApi/testModel';
import {ModelStoreAsserts} from './testApi/testApi';
import {StateMap} from '../src';

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
            .withStateHandlerObject('testStatMap', { modelPath: 'id-1', stateHandler: new TestStateObjectHandler(router, '1') })
            .withStateHandlerObject('testStatMap', { modelPath: 'id-2', stateHandler: new TestStateObjectHandler(router, '2') })
            .withStateHandlerObject('testStatMap', { modelPath: 'id-3', stateHandler: new TestStateObjectHandler(router, '3') })
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().modelMapState);
        // let actor = new Actor(modelId, router);

        router.publishEvent({modelId: 'modelId', modelPath: 'id-1'}, 'the-event', { data: 'the-data' });
        router.publishEvent({modelId: 'modelId', modelPath: 'id-2'}, 'the-event', { data: 'the-data' });
        router.publishEvent({modelId: 'modelId', modelPath: 'id-3'}, 'the-event', { data: 'the-data' });

        // asserts.entityCountIs(1);
        // asserts.expectedStatesToChange('id-1');

        asserts.state('id-1').normalEvents().eventCountIs(1);
        asserts.state('id-2').normalEvents().eventCountIs(1);
        asserts.state('id-3').normalEvents().eventCountIs(1);
    });
});