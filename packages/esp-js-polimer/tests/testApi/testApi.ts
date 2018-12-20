import {ObservationStage, Router, logging} from 'esp-js';
import {defaultStoreFactory, ReceivedEvent, TestEvent, TestState, TestStore} from './testStore';
import {TestStateHandlerMap, TestStateHandlerModel, TestStateObjectHandler} from './stateHandlers';
import {PolimerModel, PolimerStoreBuilder} from '../../src';
import {StorePostEventProcessor, StorePreEventProcessor} from '../../src/eventProcessors';

export interface PolimerTestApi {
    actor: Actor;
    model: PolimerModel<TestStore>;
    store: TestStore;
    asserts: {
        handlerMapState: StateAsserts,
        handlerObjectState: StateAsserts,
        handlerModelState: StateAsserts,
        throwsOnInvalidEventContextAction: (action: () => void, errorRegex?: RegExp),
    };
}

export class ReceivedEventsAsserts {
    constructor(private _parent: StateAsserts, private _receivedEvents: ReceivedEvent[]) {

    }
    public eventCountIs(expectedLength: number): this {
        expect(this._receivedEvents.length).toEqual(expectedLength);
        return this;
    }

    public callIs(callNumber: number, eventType: string, event: TestEvent, stage: ObservationStage): this {
        this.eventTypeIs(callNumber, eventType);
        this.eventIs(callNumber, event);
        this.observationStageIs(callNumber, stage);
        return this;
    }

    public eventTypeIs(callNumber: number, eventType: string): this {
        expect(this._receivedEvents[callNumber].eventType).toEqual(eventType);
        return this;
    }

    public eventIs(callNumber: number, event: TestEvent): this {
        expect(this._receivedEvents[callNumber].receivedEvent).toBe(event);
        return this;
    }

    public observationStageIs(callNumber: number, stage: ObservationStage): this {
        expect(this._receivedEvents[callNumber].observationStage).toEqual(stage);
        return this;
    }

    public stateIs(callNumber: number, expectedStateName: string): this {
        let receivedArgument = this._receivedEvents[callNumber];
        expect(receivedArgument.stateReceived).toEqual(true);
        expect(receivedArgument.stateName).toEqual(expectedStateName);
        return this;
    }

    public ensureEventContextReceived(callNumber: number): this {
        expect(this._receivedEvents[callNumber].eventContextReceived).toEqual(true);
        return this;
    }

    public ensureStoreReceived(callNumber: number): this {
        expect(this._receivedEvents[callNumber].storeReceived).toEqual(true);
        return this;
    }

    public end(): StateAsserts {
        return this._parent;
    }
}

export class StateAsserts {
    private _lastState: TestState;
    constructor(private _stateGetter: () => TestState) {

    }
    private get _state() {
        return this._stateGetter();
    }
    public captureCurrentState(): this {
        this._lastState = this._stateGetter();
        return this;
    }
    public stateInstanceHasChanged(expectedNextState?: TestState): this {
        // preconditions
        expect(this._lastState).toBeDefined();
        const currentState = this._stateGetter();
        expect(this._lastState).toBeDefined();
        expect(this._lastState).not.toBe(currentState);
        if (expectedNextState) {
            expect(currentState).toBe(expectedNextState);
        }
        return this;
    }
    public previewEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this, this._state.receivedEventsAtPreview);
    }
    public normalEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this, this._state.receivedEventsAtNormal);
    }
    public committedEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this, this._state.receivedEventsAtCommitted);
    }
    public finalEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this, this._state.receivedEventsAtFinal);
    }
    public receivedEventsAll(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this, this._state.receivedEventsAll);
    }
}

export class Actor {
    constructor(private _modelId: string, private _router: Router) {
    }
    public publishEvent(eventType: string, event?: TestEvent) {
        event = event || {};
        this._router.publishEvent(this._modelId, eventType, event);
        return event;
    }
    public publishEventWhichFiltersAtPreviewStage<TKey extends keyof TestStore>(eventType: string) {
        let testEvent = <TestEvent>{ shouldFilter: true, filterAtStage: ObservationStage.preview};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichFiltersAtNormalStage<TKey extends keyof TestStore>(eventType: string) {
        let testEvent = <TestEvent>{ shouldFilter: true, filterAtStage: ObservationStage.normal};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichFiltersAtCommitStage<TKey extends keyof TestStore>(eventType: string) {
        let testEvent = <TestEvent>{ shouldFilter: true, filterAtStage: ObservationStage.committed};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCancelsAtPreviewStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCancel: true, cancelAtStage: ObservationStage.preview, stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCancelsAtNormalStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCancel: true, cancelAtStage: ObservationStage.normal, stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCancelsAtFinalStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCancel: true, cancelAtStage: ObservationStage.final, stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCancelsAtCommittedStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{
            shouldCommit: true,
            commitAtStages: [ObservationStage.normal],
            shouldCancel: true,
            cancelAtStage: ObservationStage.committed,
            stateTakingAction: stateNameWhichDoesTheCommit
        };
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCancelsInEventFilter<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCancel: true, cancelInEventFilter: true, stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCommitsAtPreviewStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCommit: true, commitAtStages: [ObservationStage.preview], stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCommitsAtNormalStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCommit: true, commitAtStages: [ObservationStage.normal], stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCommitsAtCommittedStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{
            shouldCommit: true,
            commitAtStages: [ObservationStage.normal, ObservationStage.committed],
            stateTakingAction: stateNameWhichDoesTheCommit
        };
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCommitsAtFinalStage<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCommit: true, commitAtStages: [ObservationStage.final], stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
    public publishEventWhichCommitsInEventFilter<TKey extends keyof TestStore>(eventType: string, stateNameWhichDoesTheCommit: TKey) {
        let testEvent = <TestEvent>{ shouldCommit: true, commitInEventFilter: true, stateTakingAction: stateNameWhichDoesTheCommit};
        this._router.publishEvent(this._modelId, eventType, testEvent);
        return testEvent;
    }
}

export class PolimerTestApiBuilder {
    private _useHandlerMap: boolean;
    private _useHandlerObject: boolean;
    private _useHandlerModel: boolean;
    private _preEventProcessor?: StorePreEventProcessor<TestStore>;
    private _postEventProcessor?: StorePostEventProcessor<TestStore>;

    public static create(): PolimerTestApiBuilder {
        return new PolimerTestApiBuilder();
    }

    public withPreEventProcessor(preEventProcessor?: StorePreEventProcessor<TestStore>): this {
        this._preEventProcessor = preEventProcessor;
        return this;
    }

    public withPostEventProcessor(postEventProcessor?: StorePostEventProcessor<TestStore>): this {
        this._postEventProcessor = postEventProcessor;
        return this;
    }

    public withStateHandlerMap() {
        this._useHandlerMap = true;
        return this;
    }

    public withStateHandlerObject() {
        this._useHandlerObject = true;
        return this;
    }

    public withStateHandlerModel() {
        this._useHandlerModel = true;
        return this;
    }

    public build(): PolimerTestApi {
        // stop esp logging to the console by default (so unhappy path tests to fill up the console with errors).
        logging.Logger.setSink(() => {});
        let router = new Router();
        let modelId = 'modelId';
        let initialStore = defaultStoreFactory(modelId);
        let builder: PolimerStoreBuilder<TestStore>  = router
            .storeBuilder<TestStore>()
            .withInitialStore(initialStore);
        if (this._useHandlerMap) {
            builder.withStateHandlerMap('handlerMapState', TestStateHandlerMap);
        }
        if (this._useHandlerObject) {
            builder.withStateHandlerObject('handlerObjectState', new TestStateObjectHandler());
        }
        if (this._useHandlerModel) {
            let testStateObject = new TestStateHandlerModel(modelId, router);
            builder.withStateHandlerModel('handlerModelState', testStateObject);
            testStateObject.initialise();
        }
        if (this._preEventProcessor) {
            builder.withPreEventProcessor(this._preEventProcessor);
        }
        if (this._postEventProcessor) {
            builder.withPostEventProcessor(this._postEventProcessor);
        }
        let model = builder.registerWithRouter();
        // TestStateObject is a classic esp model, it is modeled here to have a typical external lifecycle and manages it's state internally
        let currentStore: TestStore;
        router.getModelObservable<PolimerModel<TestStore>>(modelId).map(m => m.getStore()).subscribe(store => {
            currentStore = store;
        });
        return {
            actor: new Actor(modelId, router),
            model,
            get store() {
                return this.model.getStore();
            },
            asserts: {
                handlerMapState: new StateAsserts(() => currentStore.handlerMapState),
                handlerObjectState: new StateAsserts(() => currentStore.handlerObjectState),
                handlerModelState: new StateAsserts(() => currentStore.handlerModelState),
                throwsOnInvalidEventContextAction(action: () => void, errorRegex?: RegExp) {
                    expect(action).toThrow(errorRegex || /You can't .* an event at the .* stage.*/);
                }
            }
        };
    }
}