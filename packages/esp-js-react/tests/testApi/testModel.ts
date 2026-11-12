import {EventContext, EventBus} from 'esp-js';

export type TestModelState = { value: string, modelId: string, entityKey: string };

export const createTestModel = (bus: EventBus, storeId: string): TestModelState => {
    const initialState: TestModelState = {
        value: 'initial-value',
        entityKey: '',
        modelId: storeId,
    };
    bus.storeBuilder<TestModelState>(storeId, initialState)
        .withEventHandler('test-event', (draft, ev: string) => {
            draft.value = ev;
        })
        .withEventHandler('test-event-with-entity-key', (draft, ev: string, ctx: EventContext) => {
            draft.entityKey = ctx.entityKey;
            draft.value = ev;
        })
        .build();
    return initialState;
};
