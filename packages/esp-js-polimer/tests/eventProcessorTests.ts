import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst} from './testApi/testModel';

describe('State Handlers', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlers()
            .build();
    });

    describe('Event Processors', () => {
        it('calls preProcess hook when model change about to start', () => {
            api.asserts.preEventProcessorCountIs(0);
            api.actor.publishEvent(EventConst.event6);
            api.asserts.handlerObjectState.normalEvents().eventCountIs(2);
            api.asserts.preEventProcessorCountIs(1);
        });

        it('calls a registered postProcess hook when model change finished', () => {
            api.asserts.postEventProcessorCountIs(0);
            api.actor.publishEvent(EventConst.event6);
            api.asserts.handlerObjectState.normalEvents().eventCountIs(2);
            api.asserts.postEventProcessorCountIs(1);
        });
    });
});