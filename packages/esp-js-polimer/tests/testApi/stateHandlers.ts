import {multipleEvents, PolimerHandlerMap, PolimerModel} from '../../src/';
import {defaultTestStateFactory, EventConst, ReceivedEvent, TestEvent, TestState, TestStore} from './testStore';
import {EventContext, DefaultEventContext, ObservationStage, observeEvent, PolimerEventPredicate, ObserveEventPredicate, DisposableBase, Router} from 'esp-js';

function processEvent(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
    let receivedEvent = <ReceivedEvent>{
        eventType: eventContext.eventType,
        receivedEvent: ev,
        observationStage: eventContext.currentStage,
        stateName: draft.stateName,
        stateReceived: isTestState(draft),
        storeReceived: isTestStore(store),
        eventContextReceived: eventContext instanceof DefaultEventContext,
    };
    if (eventContext.currentStage === ObservationStage.preview) {
        draft.receivedEventsAtPreview.push(receivedEvent);
    } else if (eventContext.currentStage === ObservationStage.normal) {
        draft.receivedEventsAtNormal.push(receivedEvent);
    } else if (eventContext.currentStage === ObservationStage.committed) {
        draft.receivedEventsAtCommitted.push(receivedEvent);
    } else if (eventContext.currentStage === ObservationStage.final) {
        draft.receivedEventsAtFinal.push(receivedEvent);
    }
    draft.receivedEventsAll.push(receivedEvent);
    if (ev.stateTakingAction === draft.stateName) {
        if (ev.shouldCancel && eventContext.currentStage === ev.cancelAtStage) {
            eventContext.cancel();
        }
        if (ev.shouldCommit && ev.commitAtStages && ev.commitAtStages.includes(eventContext.currentStage)) {
            eventContext.commit();
        }
    }
}

function isTestState(state: any): state is TestState {
    let testState = <TestState>state;
    return testState && testState.stateName !== undefined;
}

function isTestStore(store: any): store is TestStore {
    let testStore = <TestStore>store;
    return testStore && (
        testStore.handlerMapState !== undefined &&
        testStore.handlerModelState !== undefined &&
        testStore.handlerObjectState !== undefined
    );
}

const polimerEventPredicate: PolimerEventPredicate = (draft: TestState, event: TestEvent, store: TestStore, eventContext: EventContext) => {
    if (event.shouldCancel && event.cancelInEventFilter) {
        eventContext.cancel();
    }
    if (event.shouldCommit && event.commitInEventFilter) {
        eventContext.commit();
    }
    return !event.shouldFilter;
};

const observeEventPredicate: ObserveEventPredicate = (model?: any, event?: TestEvent, eventContext?: EventContext) => {
    if (event.shouldCancel && event.cancelInEventFilter) {
        eventContext.cancel();
    }
    if (event.shouldCommit && event.commitInEventFilter) {
        eventContext.commit();
    }
    return !event.shouldFilter;
};

export const TestStateHandlerMap: PolimerHandlerMap<TestState, TestStore> = {
    [EventConst.event1]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, store, eventContext);
    },
    [EventConst.event2]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, store, eventContext);
    },
    [multipleEvents(EventConst.event3, EventConst.event4)]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, store, eventContext);
    },
    [EventConst.event5]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        if (ev.replacementState) {
            return ev.replacementState;
        }
        processEvent(draft, ev, store, eventContext);
    },
};

export class TestStateObjectHandler {
    @observeEvent(EventConst.event1, ObservationStage.preview)
    @observeEvent(EventConst.event1) // defaults to ObservationStage.normal
    @observeEvent(EventConst.event1, ObservationStage.committed)
    @observeEvent(EventConst.event1, ObservationStage.final)
    _event1Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }

    @observeEvent(EventConst.event2, ObservationStage.preview)
    @observeEvent(EventConst.event2, ObservationStage.normal)
    @observeEvent(EventConst.event2, ObservationStage.committed)
    @observeEvent(EventConst.event2, ObservationStage.final)
    _event2Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }
    @observeEvent(EventConst.event3)
    @observeEvent(EventConst.event4)
    _event3And4Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }
    @observeEvent(EventConst.event5, polimerEventPredicate)
    _event5Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        if (ev.replacementState) {
            return ev.replacementState;
        }
        processEvent(draft, ev, store, eventContext);
    }
}

// this model is a more classic esp based model which can interop with polimer state handlers,
// it won't receive an immer based model to mutate state, rather state is maintained internally
export class TestStateHandlerModel extends DisposableBase {
    private _currentState: TestState;

    constructor(private _modelId, private _router: Router) {
        super();
        this._currentState = defaultTestStateFactory('handlerModelState');
    }
    public initialise(): void {
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    }

    @observeEvent(EventConst.event1, ObservationStage.preview)
    @observeEvent(EventConst.event1) // defaults to ObservationStage.normal
    @observeEvent(EventConst.event1, ObservationStage.committed)
    @observeEvent(EventConst.event1, ObservationStage.final)
    _event1Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, model.getStore(), eventContext);
        this._replaceState();
    }

    @observeEvent(EventConst.event2, ObservationStage.preview)
    @observeEvent(EventConst.event2, ObservationStage.normal)
    @observeEvent(EventConst.event2, ObservationStage.committed)
    @observeEvent(EventConst.event2, ObservationStage.final)
    _event2Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, model.getStore(), eventContext);
        this._replaceState();
    }
    @observeEvent(EventConst.event3)
    @observeEvent(EventConst.event4)
    _event3And4Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, model.getStore(), eventContext);
        this._replaceState();
    }

    @observeEvent(EventConst.event5, observeEventPredicate)
    _event5Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, model.getStore(), eventContext);
        this._replaceState();
    }

    private _replaceState() {
        // emulate internal update of immutable state
        this._currentState = { ... this._currentState };
    }

    public getState(): TestState {
        return this._currentState;
    }
}