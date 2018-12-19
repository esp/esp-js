import {ObservationStage} from 'esp-js';
import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst} from './testApi/testStore';

describe('State Handlers', () => {
    let api: PolimerTestApi;

    describe('Event Processors', () => {
        it('calls a registered preProcess hook when model change about to start', () => {});

        it('calls a registered postProcess hook when model change finished', () => {});
    });

    describe('Event Observation', () => {

        describe('handler maps', () => {
            beforeEach(() => {
                api = PolimerTestApiBuilder.create()
                    .withStateHandlerMap()
                    .build();
                api.asserts.handlerMapState.captureCurrentState();
            });

            afterEach(() => {
                api.asserts.handlerMapState.stateInstanceHasChanged();
            });

            it('can receives events at normal stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerMapState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal).end();
            });

            it('can receives multiple events via same handler', () => {
                let event3 = api.actor.publishEvent(EventConst.event3);
                let event4 = api.actor.publishEvent(EventConst.event4);
                api.asserts.handlerMapState
                    .normalEvents()
                    .eventCountIs(2)
                    .event(0).is(EventConst.event3, event3, ObservationStage.normal).end()
                    .event(1).is(EventConst.event4, event4, ObservationStage.normal).end();
            });
        });

        describe('handler objects', () => {
            beforeEach(() => {
                api = PolimerTestApiBuilder.create()
                    .withStateHandlerObject()
                    .build();
                api.asserts.handlerObjectState.captureCurrentState();
            });

            afterEach(() => {
                api.asserts.handlerObjectState.stateInstanceHasChanged();
            });

            it('can receives events at preview stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerObjectState
                    .previewEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.preview).end();
            });

            it('can receives events at normal stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerObjectState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal).end();
            });

            it('can receives events at committed stage', () => {
                let testEvent = api.actor.publishEventWhichCommitsAtNormalStage(EventConst.event1, 'handlerObjectState');
                api.asserts.handlerObjectState
                    .committedEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.committed).end();
            });

            it('can receives events at final stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerObjectState
                    .finalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.final).end();
            });

            it('can receives multiple events via same handler', () => {
                let event3 = api.actor.publishEvent(EventConst.event3);
                let event4 = api.actor.publishEvent(EventConst.event4);
                api.asserts.handlerObjectState
                    .normalEvents()
                    .eventCountIs(2)
                    .event(0).is(EventConst.event3, event3, ObservationStage.normal).end()
                    .event(1).is(EventConst.event4, event4, ObservationStage.normal).end();
            });
        });

        describe('handler models', () => {
            beforeEach(() => {
                api = PolimerTestApiBuilder.create()
                    .withStateHandlerModel()
                    .build();
                api.asserts.handlerModelState.captureCurrentState();
            });

            afterEach(() => {
                api.asserts.handlerModelState.stateInstanceHasChanged();
            });

            it('can receives events at preview stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerModelState
                    .previewEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.preview).end();
            });

            it('can receives events at normal stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerModelState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal).end();
            });

            it('can receives events at committed stage', () => {
                let testEvent = api.actor.publishEventWhichCommitsAtNormalStage(EventConst.event1, 'handlerModelState');
                api.asserts.handlerModelState
                    .committedEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.committed).end();
            });

            it('can receives events at final stage', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerModelState
                    .finalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.final).end();
            });

            it('can receives multiple events via same handler', () => {
                let event3 = api.actor.publishEvent(EventConst.event3);
                let event4 = api.actor.publishEvent(EventConst.event4);
                api.asserts.handlerModelState
                    .normalEvents()
                    .eventCountIs(2)
                    .event(0).is(EventConst.event3, event3, ObservationStage.normal).end()
                    .event(1).is(EventConst.event4, event4, ObservationStage.normal).end()
            });
        });

        describe('handler compositions', () => {
            beforeEach(() => {
                api = PolimerTestApiBuilder.create()
                    .withStateHandlerMap()
                    .withStateHandlerObject()
                    .withStateHandlerModel()
                    .build();
                api.asserts.handlerMapState.captureCurrentState();
                api.asserts.handlerObjectState.captureCurrentState();
                api.asserts.handlerModelState.captureCurrentState();
            });

            afterEach(() => {
                api.asserts.handlerMapState.stateInstanceHasChanged();
                api.asserts.handlerObjectState.stateInstanceHasChanged();
                api.asserts.handlerModelState.stateInstanceHasChanged();
            });

            it('updates all states that observed the event', () => {
                let testEvent = api.actor.publishEvent(EventConst.event1);
                api.asserts.handlerMapState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal);
                api.asserts.handlerObjectState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal);
                api.asserts.handlerModelState
                    .normalEvents()
                    .eventCountIs(1)
                    .event(0).is(EventConst.event1, testEvent, ObservationStage.normal);
            });
        });

        describe('EventContext interactions', () => {
            it('can not cancel event within an event filter', () => {

            });

            it('can not commit an event within an event filter', () => {

            });

            it('can cancel an event at the preview stage', () => {

            });

            it('can not cancel an event at the normal stage', () => {

            });

            it('can not cancel an event at the committed stage', () => {

            });

            it('can not cancel an event at the final stage', () => {

            });

            it('can commit an event at the normal stage', () => {

            });

            it('can not commit an event at the preview stage', () => {

            });

            it('can not commit an event at the committed stage', () => {

            });

            it('can not commit an event at the final stage', () => {

            });
        });
    });

    describe('Dispatch handler signature', () => {
        it('receives the current state', () => {

        });

        it('receives the given event', () => {

        });

        it('receives the current store', () => {

        });

        it('receives the event context', () => {

        });
    });

    describe('Event Predicate', () => {
        it('can filter event at preview stage', () => {

        });

        it('can filter event at normal stage', () => {

        });

        it('can filter event at committed stage', () => {

        });

        it('can filter event at final stage', () => {

        });
    });

    describe('State handler mutations', () => {
        it('mutative state changes result in a new state object', () => {

        });

        it('can replace the state with a returned object', () => {

        });
    });

    describe('Model disposal tests', () => {
        it('disposing the PolmierModel cancels event subscriptions', () => {

        });
    });

    describe('Interop with classic esp models', () => {
        it('preProcess is called', () => {

        });

        it('postProcess is called', () => {

        });

        it('disposes the event subscriptions when the parent model is disposed', () => {

        });

        it('updates the store after final observation stage dispatched', () => {

        });

        describe('Autowire up events', () => {
            it('preProcess is called', () => {

            });

            it('postProcess is called', () => {

            });

            it('wires the model up the router', () => {

            });

            it('disposes the event subscriptions when the parent model is disposed', () => {

            });
        });

        describe('Manual wire up events', () => {
            it('preProcess is called', () => {

            });

            it('postProcess is called', () => {

            });

            it('wires the model up the router', () => {

            });

            it('disposes the event subscriptions when the parent model is disposed', () => {

            });
        });
    });
});