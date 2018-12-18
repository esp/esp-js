import {multipleEvents, PolimerHandlerMap} from '../../src/';
import {EventConst, ReceivedEvent, TestEvent, TestState, TestStore} from './testStore';
import {EventContext, ObservationStage, observeEvent, PolimerEventPredicate} from 'esp-js';

function processEvent(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
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

const eventPredicate: PolimerEventPredicate = (draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) => {
    if (ev.shouldFilter && eventContext.currentStage === ev.filterAtStage) {
        return false;
    }
    return true;
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
    }
};

export class TestStateObjectHandler {
    @observeEvent(EventConst.event1, ObservationStage.preview)
    @observeEvent(EventConst.event1) // defaults to ObservationStage.normal
    @observeEvent(EventConst.event1, ObservationStage.committed)
    @observeEvent(EventConst.event1, ObservationStage.final)
    _event1Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }

    @observeEvent(EventConst.event2, ObservationStage.preview, eventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.normal, eventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.committed, eventPredicate)
    @observeEvent(EventConst.event2, ObservationStage.final, eventPredicate)
    _event2Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }
    @observeEvent(EventConst.event3)
    @observeEvent(EventConst.event4)
    _event3And4Handler(draft: TestState, ev: TestEvent, store: TestStore, eventContext: EventContext) {
        processEvent(draft, ev, store, eventContext);
    }
}

export class TestStateObject {
    private _currentState: TestState;
    public getState(): TestState {
        return this._currentState;
    }
}