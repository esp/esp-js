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
    outputEventsEntityKey?: string;
    transformedEventKey?: string;
    publishToModelId?: string;
    data?: string;
    outputEventType?: string;
    outputEvent?: TestEvent;
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
    event9: 'event9',
    eventNotObservedByModel: 'eventNotObservedByModel',
    newStateForModelMap_configure: 'newStateForModelMap_configure',
    newStateForModelMap_configured: 'newStateForModelMap_configured',
};

export interface ReceivedEvent {
    eventType: string;
    receivedEvent: TestEvent;
    observationStage: ObservationStage;
    stateReceived: boolean;
    stateName: string;
    modelReceived: boolean;
    eventContextReceived: boolean;
    modelId: string;
    entityKey: string;
    nameOfStateHandlerReceivingEvent: string;
}

export interface TestState {
    stateName: string;
    receivedEventsAtPreview: ReceivedEvent[];
    receivedEventsAtNormal: ReceivedEvent[];
    receivedEventsAtCommitted: ReceivedEvent[];
    receivedEventsAtFinal: ReceivedEvent[];
    receivedEventsAll: ReceivedEvent[];
    entityKeyOfHandler: string;
}

export interface OOModelTestState extends TestState {
    preProcessInvokeCount: number;
    postProcessInvokeCount: number;
    eventHandlersReceivedStateOnModelMatchesLocalState: boolean;
}

export interface TestImmutableModel extends ImmutableModel {
    handlerObjectState: TestState;
    handlerObjectState2: TestState;
    handlerObjectState3: TestState;
    handlerModelState: OOModelTestState;
    testMapState: Map<string, TestState>;
}

export const defaultTestStateFactory = (partialState?: Partial<TestState>) => {
    return <TestState>{
        stateName: '',
        receivedEventsAtPreview: [],
        receivedEventsAtNormal: [],
        receivedEventsAtCommitted: [],
        receivedEventsAtFinal: [],
        receivedEventsAll: [],
        ...(partialState ? partialState : [])
    };
};

export const defaultOOModelTestStateFactory = (stateName: string) => {
    return <OOModelTestState>{
        ...defaultTestStateFactory({ stateName }),
        postProcessInvokeCount: 0,
        preProcessInvokeCount: 0
    };
};

export const defaultModelFactory: (modelId: string) => TestImmutableModel = (modelId: string) => {
    return {
        modelId: modelId,
        handlerObjectState: defaultTestStateFactory({ stateName: 'handlerObjectState' }),
        handlerObjectState2: defaultTestStateFactory({ stateName: 'handlerObjectState2' }),
        handlerObjectState3: defaultTestStateFactory({ stateName: 'handlerObjectState3' }),
        handlerModelState: defaultOOModelTestStateFactory('handlerObjectState'),
        testMapState: new Map([
            ['id-1', defaultTestStateFactory()],
            ['id-2', defaultTestStateFactory()],
            ['id-3', defaultTestStateFactory()]
        ])
    };
};