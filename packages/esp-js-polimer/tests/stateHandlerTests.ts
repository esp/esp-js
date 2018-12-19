import {Router, ObservationStage} from 'esp-js';
import {PolimerTestApi, PolimerTestApiFactory} from './testApi/testApi';
import {EventConst, TestEvent} from './testApi/testStore';

describe('State Handlers', () => {
    let api: PolimerTestApi;

    beforeEach(() => {
        api = PolimerTestApiFactory.create();
    });

    describe('Event Workflow', () => {

        it('calls a registered preProcess hook when model change about to start', () => {});

        it('calls a registered postProcess hook when model change finished', () => {});

        it('can receives events at preview stage', () => {
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

        it.only('can receives events at committed stage', () => {
            let testEvent = <TestEvent>{ shouldCommit: true, commitAtStage: ObservationStage.normal, cancelAtState: 'handlerObjectState' };
            api.actor.publishEvent(EventConst.event1, testEvent);

            // maps don't support ObservationStage observation
            api.asserts.handlerMapState
                .committedEvents()
                .eventCountIs(0);

            api.asserts.handlerObjectState
                .committedEvents()
                .eventCountIs(1)
                .event(0)
                .typeIs(EventConst.event1)
                .eventIs(testEvent)
                .observationStageIs(ObservationStage.committed);
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

        it('updates the store at the final observation stage', () => {

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