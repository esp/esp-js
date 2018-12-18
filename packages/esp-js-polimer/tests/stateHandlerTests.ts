import {Router, ObservationStage} from 'esp-js';
import {PolimerTestApi, PolimerTestApiFactory} from './testApi/testApi';
import {EventConst} from './testApi/testStore';

describe('State Handlers', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiFactory.create();
    });

    describe('Event Workflow', () => {
        it.only('can receives events at preview stage', () => {
            let testEvent = {};

            api.actor.publishEvent(EventConst.event1, testEvent);

            // maps don't support ObservationStage observation
            api.asserts.handlerMapState
                .previewEvents()
                .eventCountIs(0);

            api.asserts.handlerObjectState
                .previewEvents()
                .eventCountIs(1)
                .event(0)
                .typeIs(EventConst.event1)
                .eventIs(testEvent)
                .observationStageIs(ObservationStage.preview);
            //
            // api.asserts.handlerModelState
            //     .previewEvents()
            //     .eventCountIs(1)
            //     .event(0)
            //     .typeIs(EventConst.event1)
            //     .eventIs(testEvent)
            //     .observationStageIs(ObservationStage.preview);
        });

        it('can receives events at normal stage', () => {
            let testEvent = {};

            api.actor.publishEvent(EventConst.event1, testEvent);

            // maps don't support ObservationStage observation
            api.asserts.handlerMapState
                .normalEvents()
                .eventCountIs(1)
                .event(0)
                .typeIs(EventConst.event1)
                .eventIs(testEvent)
                .observationStageIs(ObservationStage.normal);

            api.asserts.handlerObjectState
                .normalEvents()
                .eventCountIs(1)
                .event(0)
                .typeIs(EventConst.event1)
                .eventIs(testEvent)
                .observationStageIs(ObservationStage.normal);
        });

        it('can receives events at committed stage', () => {

        });

        it('can receives events at final stage', () => {

        });

        it('can receives multiple events via same handler', () => {

        });

        it('updates all states that observed the event', () => {

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

});