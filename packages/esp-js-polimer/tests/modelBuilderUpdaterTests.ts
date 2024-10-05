 import {defaultModelFactory, EventConst, TestImmutableModel} from './testApi/testModel';
 import {Router} from 'esp-js';
 import {TestStateHandlerModel, TestStateObjectHandler} from './testApi/stateHandlers';
 import {Actor, OOModelTestStateAsserts, StateAsserts} from './testApi/testApi';
 import {ObjectEventTransforms} from './testApi/eventTransforms';

 describe('ModelBuilderUpdaterTests', () => {
     let router: Router;
     let modelId: string;

     beforeEach(() => {
         router = new Router();
         modelId = 'modelId';
     });

     it('Can add and remove StateHandlerObject', () => {
         let testStateObjectHandler1 = new TestStateObjectHandler({router});
         let testStateObjectHandler2 = new TestStateObjectHandler({router});

         let polimerModel = router
             .modelBuilder<TestImmutableModel>()
             .withInitialModel(defaultModelFactory(modelId))
             .withStateHandlers('handlerObjectState', testStateObjectHandler1, testStateObjectHandler2)
             .registerWithRouter();

         let asserts = new StateAsserts(() => polimerModel.getImmutableModel().handlerObjectState);
         let actor = new Actor(modelId, router);

         actor.publishEvent(EventConst.event1);
         asserts.normalEvents().eventCountIs(2); // because we have 2 handlers

         router
             .modelUpdater<TestImmutableModel>(modelId)
             .removeStateHandlers(testStateObjectHandler1)
             .updateRegistrationsWithRouter();

         actor.publishEvent(EventConst.event1);
         asserts.normalEvents().eventCountIs(3); // because we have only 1 handler now

         router
             .modelUpdater<TestImmutableModel>(modelId)
             .removeStateHandlers(testStateObjectHandler2)
             .updateRegistrationsWithRouter();

         actor.publishEvent(EventConst.event1);
         asserts.normalEvents().eventCountIs(3); // no handlers, so no change
     });

     it('Can add and remove StateHandlerModel', () => {
         let testStateHandlerModel = new TestStateHandlerModel(modelId, router);

         let polimerModel = router
             .modelBuilder<TestImmutableModel>()
             .withInitialModel(defaultModelFactory(modelId))
             .withStateHandlerModel('handlerModelState', testStateHandlerModel, true)
             .registerWithRouter();

         let asserts = new OOModelTestStateAsserts(() => polimerModel.getImmutableModel().handlerModelState, testStateHandlerModel);
         let actor = new Actor(modelId, router);

         actor.publishEvent(EventConst.event1);
         asserts.normalEvents().eventCountIs(1);

         router
             .modelUpdater<TestImmutableModel>(modelId)
             .removeStateHandlers(testStateHandlerModel)
             .updateRegistrationsWithRouter();

         actor.publishEvent(EventConst.event1);
         asserts.normalEvents().eventCountIs(1); // no handlers, so no change
     });

     it('Can add and remove EventTransforms', () => {
         let testStateObjectHandler1 = new TestStateObjectHandler({router});
         let objectEventTransforms = new ObjectEventTransforms();

         let polimerModel = router
             .modelBuilder<TestImmutableModel>()
             .withInitialModel(defaultModelFactory(modelId))
             .withStateHandlers('handlerObjectState', testStateObjectHandler1)
             .withEventTransforms(objectEventTransforms)
             .registerWithRouter();

         let asserts = new StateAsserts(() => polimerModel.getImmutableModel().handlerObjectState);
         let actor = new Actor(modelId, router);

         // send something to a transform, which ultimately goes back onto a model
         actor.publishEvent(EventConst.event7);
         asserts.normalEvents().eventCountIs(2); // the model observes event7, and the event observer pushes another event based on event7
         asserts.normalEvents().eventTypeIs(0, EventConst.event7);
         asserts.normalEvents().eventTypeIs(1, EventConst.event8); // transformed by ObjectEventTransforms in response to event7

         router
             .modelUpdater<TestImmutableModel>(modelId)
             .removeEventTransforms(objectEventTransforms)
             .updateRegistrationsWithRouter();

         actor.publishEvent(EventConst.event7);
         asserts.normalEvents().eventCountIs(3); // this should be +1 (3) as the model would have received the event, but the ObjectEventTransforms would not have pushed event8
         asserts.normalEvents().eventTypeIs(2, EventConst.event7);
     });
 });