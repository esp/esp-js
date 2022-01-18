import {ObservationStage} from 'esp-js';
import {ImmutableModel} from '../../src';

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
    eventKey?: string;
    transformedEventKey?: string;
    publishToModelId?: string;
}

export const EventConst  = {
    event1: 'event1',
    event2: 'event2',
    event3: 'event3',
    event4: 'event4',
    event5: 'event5',
    event6: 'event6',
    event7: 'event7',
    event8: 'event8',
    eventNotObservedByModel: 'eventNotObservedByModel',
};

export interface ReceivedEvent {
    eventType: string;
    receivedEvent: TestEvent;
    observationStage: ObservationStage;
    stateReceived: boolean;
    stateName: string;
    modelReceived: boolean;
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
    eventHandlersReceivedStateOnModelMatchesLocalState: boolean;
}

export interface TestImmutableModel extends ImmutableModel {
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

export const defaultModelFactory: (modelId: string) => TestImmutableModel = (modelId: string) => {
    return {
        modelId: modelId,
        handlerObjectState: defaultTestStateFactory('handlerObjectState'),
        handlerModelState: defaultOOModelTestStateFactory('handlerObjectState'),
    };
};