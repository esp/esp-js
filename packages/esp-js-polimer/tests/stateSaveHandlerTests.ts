import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {TestImmutableModel} from './testApi/testModel';

describe('State save handler tests', () => {
    let api: PolimerTestApi;

    function stateSaveHandler(model: TestImmutableModel) {
        return {
            modelId: model.modelId,
            foo: 'foo'
        };
    }

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlers()
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
});