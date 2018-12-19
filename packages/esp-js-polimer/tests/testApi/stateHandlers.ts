import {multipleEvents, PolimerHandlerMap, PolimerModel} from '../../src/';
import {defaultTestStateFactory, EventConst, ReceivedEvent, TestEvent, TestState, TestStore} from './testStore';
import {EventContext, ObservationStage, observeEvent, PolimerEventPredicate, ObserveEventPredicate, DisposableBase, Router} from 'esp-js';

function processEvent(draft: TestState, ev: TestEvent, eventContext: EventContext) {
    let eventList: ReceivedEvent[];
  //  throw new Error(`BOOM - ${eventContext.currentStage}`);
    if (eventContext.currentStage === ObservationStage.preview) {
        eventList = draft.receivedEventsAtPreview;
    } else if (eventContext.currentStage === ObservationStage.normal) {
        eventList = draft.receivedEventsAtNormal;
    } else if (eventContext.currentStage === ObservationStage.committed) {
        eventList = draft.receivedEventsAtCommitted;
    } else if (eventContext.currentStage === ObservationStage.final) {
        eventList = draft.receivedEventsAtFinal;
    }
    eventList.push(
        { eventType: eventContext.eventType, event: ev, observationStage: eventContext.currentStage}
    );
    if (ev.shouldCancel && eventContext.currentStage === ev.cancelAtStage) {
        eventContext.cancel();
    }
    if (ev.shouldCommit && eventContext.currentStage === ev.commitAtStage) {
        eventContext.commit();
    }
}

const polimerEventPredicate: PolimerEventPredicate = (draft: TestState, event: TestEvent, store: TestStore, eventContext: EventContext) => {
    if (event.shouldFilter && eventContext.currentStage === event.filterAtStage) {
        return false;
    }
    return true;
};

const observeEventPredicate: ObserveEventPredicate = (model?: any, event?: any, eventContext?: EventContext) => {
    if (event.shouldFilter && eventContext.currentStage === event.filterAtStage) {
        return false;
    }
    return true;
};

export const TestStateHandlerMap: PolimerHandlerMap<TestState, TestStore> = {
    [EventConst.event1]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, eventContext);
    },
    [EventConst.event2]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, eventContext);
    },
    [multipleEvents(EventConst.event3, EventConst.event4)]: (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
        processEvent(draft, ev, eventContext);
    }
};

export class TestStateObjectHandler {
    @observeEvent(EventConst.event1, ObservationStage.preview)
    @observeEvent(EventConst.event1) // defaults to ObservationStage.normal
    @observeEvent(EventConst.event1, ObservationStage.committed)
    @observeEvent(EventConst.event1, ObservationStage.final)
    _event1Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, eventContext);
    }

    @observeEvent(EventConst.event2, ObservationStage.preview, polimerEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.normal, polimerEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.committed, polimerEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.final, polimerEventPredicate)
    _event2Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, eventContext);
    }
    @observeEvent(EventConst.event3)
    @observeEvent(EventConst.event4)
    _event3And4Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, eventContext);
    }
}

// this model is a more classic esp based model which can interop with polimer state handlers,
// it won't receive an immer based model to mutate state, rather state is maintained internally
export class TestStateObject extends DisposableBase {
    private _currentState: TestState;

    constructor(private _modelId, private _router: Router) {
        super();
        this._currentState = defaultTestStateFactory();
    }
    public initialise(): void {
        this.addDisposable(this._router.observeEventsOn(this._modelId, this));
    }

    @observeEvent(EventConst.event1, ObservationStage.preview)
    @observeEvent(EventConst.event1) // defaults to ObservationStage.normal
    @observeEvent(EventConst.event1, ObservationStage.committed)
    @observeEvent(EventConst.event1, ObservationStage.final)
    _event1Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, eventContext);
        this._currentState = { ... this._currentState };
    }

    @observeEvent(EventConst.event2, ObservationStage.preview, observeEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.normal, observeEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.committed, observeEventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.final, observeEventPredicate)
    _event2Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, eventContext);
        this._currentState = { ... this._currentState };
    }
    @observeEvent(EventConst.event3)
    @observeEvent(EventConst.event4)
    _event3And4Handler(ev: TestEvent, eventContext: EventContext, model: PolimerModel<TestStore>) {
        processEvent(this._currentState, ev, eventContext);
        this._currentState = { ... this._currentState };
    }

    public getState(): TestState {
        return this._currentState;
    }
}