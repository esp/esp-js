import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {TestStore} from './testApi/testStore';

describe('State save handler tests', () => {
    let api: PolimerTestApi;

    function stateSaveHandler(store: TestStore) {
        return {
            modelId: store.modelId,
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
            expect(state.modelId).toEqual(api.store.modelId);
        });
    });
});