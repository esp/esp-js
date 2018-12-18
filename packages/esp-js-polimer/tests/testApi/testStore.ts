import {ObservationStage} from 'esp-js';
import {Store} from '../../src';

export interface TestEvent {
    shouldCancel?: boolean;
    cancelAtStage?: ObservationStage;
    shouldCommit?: boolean;
    commitAtStage?: ObservationStage;
    shouldFilter?: boolean;
    filterAtStage?: ObservationStage;
}

export const EventConst  = {
    event1: 'event1',
    event2: 'event2',
    event3: 'event3',
    event4: 'event4',
};

export interface ReceivedEvent {
    eventType: string;
    event: any;
    observationStage: ObservationStage;
}

export interface TestState {
    receivedEventsAtPreview: ReceivedEvent[];
    receivedEventsAtNormal: ReceivedEvent[];
    receivedEventsAtCommitted: ReceivedEvent[];
    receivedEventsAtFinal: ReceivedEvent[];
}

export interface TestStore extends Store {
    handlerMapState: TestState;
    handlerObjectState: TestState;
    handlerModelState: TestState;
}

export const defaultTestStateFactory = () => {
    return <TestState>{
        receivedEventsAtPreview: [],
        receivedEventsAtNormal: [],
        receivedEventsAtCommitted: [],
        receivedEventsAtFinal: [],
    };
};

export const defaultStoreFactory: (modelId: string) => TestStore = (modelId: string) => {
    return {
        modelId: modelId,
        handlerMapState: defaultTestStateFactory(),
        handlerObjectState: defaultTestStateFactory(),
        handlerModelState: defaultTestStateFactory(),
    };
};