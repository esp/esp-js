import {Router, ObservationStage} from 'esp-js';
import {defaultStoreFactory, ReceivedEvent, TestEvent, TestState, TestStore} from './testStore';
import {TestStateHandlerMap, TestStateObjectHandler, TestStateObject} from './stateHandlers';
import {PolimerModel} from '../../src';

export interface PolimerTestApi {
    actor: {
        publishEvent(eventType: string, testEvent: TestEvent)
    };
    model: PolimerModel<TestStore>;
    asserts: {
        handlerMapState: StateAsserts,
        handlerObjectState: StateAsserts,
        handlerModelState: StateAsserts,
    };
}

export class ReceivedEventAsserts {
    constructor(private _receivedEvent: ReceivedEvent) {

    }
    public typeIs(eventType: string): this {
        expect(this._receivedEvent.eventType).toEqual(eventType);
        return this;
    }
    public eventIs(event: TestEvent): this {
        expect(this._receivedEvent.event).toBe(event);
        return this;
    }
    public observationStageIs(stage: ObservationStage): this {
        expect(this._receivedEvent.observationStage).toEqual(stage);
        return this;
    }
}

export class ReceivedEventsAsserts {
    constructor(private _receivedEvents: ReceivedEvent[]) {

    }
    public eventCountIs(expectedLength: number): this {
        expect(this._receivedEvents.length).toEqual(expectedLength);
        return this;
    }
    public event(receivedAtIndex: number): ReceivedEventAsserts {
        return new ReceivedEventAsserts(this._receivedEvents[receivedAtIndex]);
    }
}

export class StateAsserts {
    constructor(private _stateGetter: () => TestState) {

    }
    private get _state() {
        return this._stateGetter();
    }
    public previewEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this._state.receivedEventsAtPreview);
    }
    public normalEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this._state.receivedEventsAtNormal);
    }
    public committedEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this._state.receivedEventsAtCommitted);
    }
    public finalEvents(): ReceivedEventsAsserts {
        return new ReceivedEventsAsserts(this._state.receivedEventsAtFinal);
    }
}

export class PolimerTestApiFactory {
    public static create(): PolimerTestApi {
        let router = new Router();
        let modelId = 'modelId';
        let initialStore = defaultStoreFactory(modelId);
        let model = router
            .storeBuilder<TestStore>()
            .withInitialStore(initialStore)
            .withStateHandlerMap('handlerMapState', TestStateHandlerMap)
            .withStateHandlerObject('handlerObjectState', new TestStateObjectHandler())
            .withStateHandlerModel('handlerModelState', new TestStateObject())
            .registerWithRouter();
        let currentStore: TestStore;
        router.getModelObservable<PolimerModel<TestStore>>(modelId).map(m => m.getStore()).subscribe(store => {
            currentStore = store;
        });
        return {
            actor: {
                publishEvent(eventType: string, testEvent: TestEvent) {
                    router.publishEvent(modelId, eventType, testEvent);
                }
            },
            model,
            asserts: {
                handlerMapState: new StateAsserts(() => currentStore.handlerMapState),
                handlerObjectState: new StateAsserts(() => currentStore.handlerObjectState),
                handlerModelState: new StateAsserts(() => currentStore.handlerModelState),
            }
        };
    }
}