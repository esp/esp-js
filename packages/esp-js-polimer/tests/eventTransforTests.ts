import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';

describe('Event Transforms', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlerObject()
            .build();
    });

    beforeEach(() => {

    });

    describe('Event delivery', () => {
        it.skip('Transformation stream receives event even when no state handler observing event', () => {
            // TODO
        });
    });

    describe('Model disposal tests', () => {
        it.skip('disposing the PolmierModel cancels event transformations', () => {
            // TODO
        });
    });
});