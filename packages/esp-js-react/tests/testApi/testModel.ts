import {EventContext, Router} from 'esp-js';
import {ModelBuilder} from 'esp-js';

export type TestModelState = { value: string, modelId: string, entityKey: string };

export const createTestModel = (router: Router, modelId: string): TestModelState => {
    const initialState: TestModelState = {
        value: 'initial-value',
        entityKey: '',
        modelId,
    };
    new ModelBuilder<TestModelState>(router, modelId, initialState)
        .withEventHandler('test-event', (draft, ev: string) => {
            draft.value = ev;
        })
        .withEventHandler('test-event-with-entity-key', (draft, ev: string, ctx: EventContext) => {
            draft.entityKey = ctx.entityKey;
            draft.value = ev;
        })
        .registerWithRouter();
    return initialState;
};
