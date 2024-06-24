import {observeEvent, Router} from 'esp-js';
import {TestExpandModelMapStateEventStream, TestModelMapStateHandler} from './testApi/stateHandlers';
import {defaultModelFactory, defaultTestStateFactory, EventConst, NewStateForModelMapConfigured, TestImmutableModel, TestState} from './testApi/testModel';
import {Actor, ModelStoreAsserts} from './testApi/testApi';
import {ModelMapState} from '../src';
import {eventTransformFor, InputEvent, InputEventStream, OutputEvent, OutputEventStream} from '../src';
import {map, switchAll} from 'rxjs/operators';
import {of} from 'rxjs';

// export class ExpandModelStoreEventHandler {
//     @observeEvent(EventConst.newStateForModelMap_configured)
//     _event1Handler(draft:ModelMapState<TestState>, event: NewStateForModelMapConfigured) {
//         let { newStateId } = event;
//         let testState = defaultTestStateFactory({ stateName: 'substate-1', espEntityId: newStateId });
//         draft.upsert(newStateId, testState);
//     }
// }
//
// export class ExpandModelStoreEventStream {
//
//     constructor(private _modelId: string, private _router: Router) {
//     }
//
//     @eventTransformFor(EventConst.newStateForModelMap_configure)
//     _onEvent7(inputEventStream: InputEventStream<TestImmutableModel, { }>): OutputEventStream<NewStateForModelMapConfigured> {
//         return inputEventStream
//             .pipe(
//                 map((inputEvent: InputEvent<TestImmutableModel, { }>) => {
//
//                     let { model } = inputEvent;
//
//                     const newStateId = this._getNextId(model.modelMapState);
//
//                     let testModelMapStateHandler = new TestModelMapStateHandler(this._router);
//
//                     this._router
//                         .modelUpdater(this._modelId)
//                         .withStateHandlerForModelMap('modelMapState', newStateId, testModelMapStateHandler)
//                         .updateRegistrationsWithRouter();
//
//                     let outputEvent: OutputEvent<NewStateForModelMapConfigured> = {
//                         eventType: EventConst.newStateForModelMap_configured,
//                         modelId: this._modelId,
//                         event: { newStateId: newStateId }
//                     };
//                     return of(outputEvent);
//                 }),
//                 switchAll()
//             );
//     }
//
//     private _getNextId = (state: ModelMapState<TestState>) => {
//         // figure out what our next ID will be.
//         // In real apps this could come in on the event or just be a GUID of sorts
//         const lastId = state.items.length > 0
//             ? Number(state.items[state.items.length - 1].espEntityId) + 1
//             : 1;
//         return lastId.toString();
//     }
// }

describe('Model StoreTests', () => {
    let router: Router;
    let modelId: string;

    beforeEach(() => {
        router = new Router();
        modelId = 'modelId';
    });

    it.skip('Event handler correct state for given model address', () => {
        let testModelMapStateHandler = new TestModelMapStateHandler(router);

        let polimerModel = router
            .modelBuilder<TestImmutableModel>()
            .withInitialModel(defaultModelFactory(modelId))
            .withStateHandlerForModelMap('modelMapState', '1', testModelMapStateHandler)
            .withStateHandlerForModelMap('modelMapState', '2', testModelMapStateHandler)
            .withStateHandlerForModelMap('modelMapState', '3', testModelMapStateHandler)

            // state handler that acts on the entire ModelMapState, this is just treating it like any other state handler, no special Polimer behaviour
            // TODO we should test this works ok with polimer .withStateHandlerObject('modelMapState', testModelMapStateHandler)
            .registerWithRouter();

        let asserts = new ModelStoreAsserts(() => polimerModel.getImmutableModel().modelMapState);
        let actor = new Actor(modelId, router);

        router.publishEvent({modelId: 'modelId', modelPath: 'modelMapState://id-1'}, 'the-event', { data: 'the-data' });

        asserts.entityCountIs(1);
        asserts.expectedStatesToChange('id-1');

        asserts.state('id-1').normalEvents().eventCountIs(1);
    });
});