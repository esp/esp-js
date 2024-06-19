import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {defaultModelFactory, TestImmutableModel, TestSubModelEntity} from './testApi/testModel';
import {Router} from 'esp-js';
import {PolimerModelBuilder} from '../src';

describe('Model StoreTests', () => {
    let api: PolimerTestApi;

    function stateSaveHandler(model: TestImmutableModel) {
        return {
            modelId: model.modelId,
            foo: 'foo'
        };
    }

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlerObject()
            .withStateSaveHandler(stateSaveHandler)
            .build();
        api.asserts.polimerModelIsRegistered(true);
    });

    it('Save state handler configured on PolimerModel', () => {
        api.asserts.assertSavedState(state => {
            expect(state.foo).toEqual('foo');
            expect(state.modelId).toEqual(api.model.modelId);
        });
    });


    it('Spike API', () => {
        let router = new Router();
        let modelId = 'modelId';
        let initialModel = defaultModelFactory(modelId);
        router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(initialModel)
            // .withModelMapStateHandlerObject('handlerObjectState', {})
            .withModelMapStateHandlerObject('modelMapState', {})
            .registerWithRouter();
    });

});