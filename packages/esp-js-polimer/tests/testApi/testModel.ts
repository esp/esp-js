import {ObservationStage} from 'esp-js';
import {ImmutableModel, ModelMapState} from '../../src';

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

export interface NewStateForModelMapConfigured {
    newStateId: string;
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
}

export interface TestState {
    espEntityId: string; // used by the ModelMapState tests
    stateName: string;
    receivedEventsAtPreview: ReceivedEvent[];
    receivedEventsAtNormal: ReceivedEvent[];
    receivedEventsAtCommitted: ReceivedEvent[];
    receivedEventsAtFinal: ReceivedEvent[];
    receivedEventsAll: ReceivedEvent[];
}

// export interface TestSubModelEntity extends EspModelEntity {
//
// }

export interface OOModelTestState extends TestState {
    preProcessInvokeCount: number;
    postProcessInvokeCount: number;
    eventHandlersReceivedStateOnModelMatchesLocalState: boolean;
}

export interface TestImmutableModel extends ImmutableModel {
    handlerObjectState: TestState;
    handlerModelState: OOModelTestState;
    modelMapState: ModelMapState<TestState>;
}

export const defaultTestStateFactory = (partialState: Partial<TestState>) => {
    return <TestState>{
        espEntityId: '',
        stateName: '',
        receivedEventsAtPreview: [],
        receivedEventsAtNormal: [],
        receivedEventsAtCommitted: [],
        receivedEventsAtFinal: [],
        receivedEventsAll: [],
        ...partialState
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
        handlerModelState: defaultOOModelTestStateFactory('handlerObjectState'),
        modelMapState: new ModelMapState<TestState>()
    };
};