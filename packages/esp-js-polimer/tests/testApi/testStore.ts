import {ObservationStage} from 'esp-js';
import {Store} from '../../src';

export interface TestEvent {
    shouldCancel?: boolean;
    cancelAtStage?: ObservationStage;
    cancelAtState?: string;
    cancelInEventFilter?: boolean;
    shouldCommit?: boolean;
    commitAtStages?: ObservationStage[];
    commitAtState?: string;
    commitInEventFilter?: boolean;
    shouldFilter?: boolean;
    stateTakingAction?: string;
    replacementState?: TestState;
}

export const EventConst  = {
    event1: 'event1',
    event2: 'event2',
    event3: 'event3',
    event4: 'event4',
    event5: 'event5',
    event6: 'event6',
};

export interface ReceivedEvent {
    eventType: string;
    receivedEvent: TestEvent;
    observationStage: ObservationStage;
    stateReceived: boolean;
    stateName: string;
    storeReceived: boolean;
    eventContextReceived: boolean;
}

export interface TestState {
    stateName: string;
    receivedEventsAtPreview: ReceivedEvent[];
    receivedEventsAtNormal: ReceivedEvent[];
    receivedEventsAtCommitted: ReceivedEvent[];
    receivedEventsAtFinal: ReceivedEvent[];
    receivedEventsAll: ReceivedEvent[];
}

export interface OOModelTestState extends TestState {
    preProcessInvokeCount: number;
    postProcessInvokeCount: number;
}

export interface TestStore extends Store {
    handlerMapState: TestState;
    handlerObjectState: TestState;
    handlerModelState: OOModelTestState;
}

export const defaultTestStateFactory = (stateName: string) => {
    return <TestState>{
        stateName: stateName,
        receivedEventsAtPreview: [],
        receivedEventsAtNormal: [],
        receivedEventsAtCommitted: [],
        receivedEventsAtFinal: [],
        receivedEventsAll: []
    };
};

export const defaultOOModelTestStateFactory = (stateName: string) => {
    return <OOModelTestState>{
        ...defaultTestStateFactory(stateName),
        postProcessInvokeCount: 0,
        preProcessInvokeCount: 0
    };
};

export const defaultStoreFactory: (modelId: string) => TestStore = (modelId: string) => {
    return {
        modelId: modelId,
        handlerMapState: defaultTestStateFactory('handlerMapState'),
        handlerObjectState: defaultTestStateFactory('handlerObjectState'),
        handlerModelState: defaultOOModelTestStateFactory('handlerObjectState'),
    };
};