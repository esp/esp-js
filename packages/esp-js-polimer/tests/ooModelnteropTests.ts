import {PolimerTestApi, PolimerTestApiBuilder} from './testApi/testApi';
import {EventConst} from './testApi/testStore';

describe('OO models interop', () => {
    let api: PolimerTestApi;

    function runCommonTests() {
        it('preProcess is called', () => {
            api.asserts.handlerModelState.preProcessInvokeCountIs(0);
            api.actor.publishEvent(EventConst.event1);
            api.asserts.handlerModelState.preProcessInvokeCountIs(1);
        });

        it('preProcess updates the store for the state in question', () => {
            // the preProcess hook will mutate the state (increments a count), that latest state should then be on
            // the store by the time the event handler executes.
            api.actor.publishEvent(EventConst.event7);
            api.asserts.handlerModelState.eventHandlersReceivedStateOnStoreMatchesLocalState();
        });

        it('postProcess is called', () => {
            api.asserts.handlerModelState.postProcessInvokeCountIs(0);
            api.actor.publishEvent(EventConst.event1);
            api.asserts.handlerModelState.postProcessInvokeCountIs(1);
        });

        it('postProcess updates the store for the state in question', () => {
            api.actor.publishEvent(EventConst.event1);
            api.asserts.handlerModelState.modelsStateMatchesStoresState();
        });

        it('disposes the event subscriptions when the parent model is disposed', () => {
            api.asserts.handlerModelState.isDisposed(false);
            api.disposeModel();
            api.asserts.handlerModelState.isDisposed();
        });

        it('store is updated after final observation stage dispatched', () => {
            api.asserts.handlerModelState.captureCurrentState();
            api.actor.publishEvent(EventConst.event1);
            api.asserts.handlerModelState
                .stateInstanceHasChanged()
                .normalEvents().eventCountIs(1);
        });

        it('wires the model up the router', () => {
            api.asserts.polimerModelIsRegistered(true);
            api.actor.publishEvent(EventConst.event1);
            api.asserts.handlerModelState.normalEvents().eventCountIs(1);
        });
    }

    describe('Manual wire up events', () => {
        beforeEach(() => {
            api = PolimerTestApiBuilder.create()
                .withStateHandlerModel()
                .build();
        });
        runCommonTests();
    });

    describe('Autowire up events', () => {
        beforeEach(() => {
            api = PolimerTestApiBuilder.create()
                .withStateHandlerModel(true)
                .build();
        });
        runCommonTests();
    });
});