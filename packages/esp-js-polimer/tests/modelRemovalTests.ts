import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst} from './testApi/testStore';
import {PolimerEvents} from '../src';

describe('Model disposal tests', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlerObject()
            .build();
        api.asserts.polimerModelIsRegistered(true);
    });

    it('can\'t publish to removed model', () => {
        api.actor.publishEvent(EventConst.event1);
        api.asserts.handlerObjectState.normalEvents().eventCountIs(1);
        api.removeModel();
        api.asserts.polimerModelIsRegistered(false);
    });

    it('disposing removes the model from the router', () => {
        api.actor.publishEvent(EventConst.event1);
        api.asserts.handlerObjectState.normalEvents().eventCountIs(1);
        api.disposeModel();
        api.asserts.polimerModelIsRegistered(false);
    });

    it('can dispose with event', () => {
        api.actor.publishEvent(EventConst.event1);
        api.asserts.handlerObjectState.normalEvents().eventCountIs(1);
        api.actor.publishEvent(PolimerEvents.disposeModel, {});
        api.asserts.polimerModelIsRegistered(false);
    });
});