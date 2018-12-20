import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst} from './testApi/testStore';
import {ObservationStage} from 'esp-js';

describe('Event Transforms', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlerObject()
            .withEventTransformModel()
            .build();
    });

    describe('Event delivery', () => {
        it('Transformed events are published to the model', () => {
            // the event transforms will publish event8 back to the model
            let event = api.actor.publishEvent(EventConst.event7, {eventKey: 'myEvent'});
            let asserts = api.asserts.handlerObjectState.normalEvents();
            asserts.eventCountIs(2);
            asserts.callIs(0, EventConst.event7, event, ObservationStage.normal);
            // now test the transformed event, which is at index 1
            asserts
                .eventTypeIs(1, EventConst.event8)
                .observationStageIs(1, ObservationStage.normal)
                .eventKeyIs(1, 'myEvent')
                .eventTransformedKeyIs(1, 'transformedEvent_event7');
        });

        it.skip('Transformation stream receives event even when no state handler observing event', () => {
        });
    });

    describe('Model disposal tests', () => {
        it.skip('disposing the PolmierModel cancels event transformations', () => {
        });
    });
});