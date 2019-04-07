import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst, TestEvent} from './testApi/testModel';
import {ObservationStage} from 'esp-js';
import {EventEnvelope} from 'esp-js/src';

describe('Event Transforms', () => {
    let api: PolimerTestApi;
    let model2: {};
    let receivedEvents: EventEnvelope<TestEvent, any>[];

    beforeEach(() => {
        api = PolimerTestApiBuilder.create()
            .withStateHandlerObject()
            .withEventTransformModel()
            .build();
        model2 = {};
        receivedEvents = [];
        api.router.addModel('model2', model2);
        api.router.getEventObservable('model2', EventConst.event8).subscribe(eventEnvelope => {
            receivedEvents.push(eventEnvelope);
        });
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

        it('Transformed events are published to specific model', () => {
            // the event transforms will publish event8 back to the model
            api.actor.publishEvent(EventConst.eventNotObservedByModel, {eventKey: 'myEvent', publishToModelId: 'model2'});
            api.asserts.handlerObjectState.normalEvents().eventCountIs(0);
            expect(receivedEvents.length).toEqual(1);
            expect(receivedEvents[0].event.transformedEventKey).toEqual('transformedEvent_eventNotObservedByModel');
        });

        it('Transformation stream receives event even when no state handler observing event', () => {
            // the event transforms will publish event8 back to the model
            api.actor.publishEvent(EventConst.eventNotObservedByModel, {eventKey: 'myEvent'});
            // now test the transformed event, which is at index 1
            api.asserts.handlerObjectState.normalEvents()
                .eventCountIs(1)
                .eventTypeIs(0, EventConst.event8)
                .observationStageIs(0, ObservationStage.normal)
                .eventKeyIs(0, 'myEvent')
                .eventTransformedKeyIs(0, 'transformedEvent_eventNotObservedByModel');
        });
    });
});