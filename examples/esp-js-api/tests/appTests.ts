import {
    runAcyncOperationWithRunActionExample,
    runAcyncOperationWithWorkItemExample,
    runBasicExample,
    runErrorFlowsExample,
    runEventWorkflowExample,
    runModelObserveExample,
    runModelRouter,
    runObserveApiBasicExample,
    runModelToModelCommunicationsWithEvents,
    runModelToModelCommunicationsWithRunAction,
    runModelToModelCommunicationsWithObservables1,
    runModelToModelCommunicationsWithObservables2,
} from '../src/app';

/**
 * This is a bit of a poor-mans catch all.
 *
 * We can't really tests API examples, but we can have a higher level integration tests that just runes each one.
 *
 * If there are any unhandled errors we'll be able to catch that.
 */
describe('app test', () => {
    const log = console.log;

    beforeAll(()=> {
        console.log = jest.fn();
        jest.useFakeTimers();
    });

    afterAll(()=> {
        console.log = log;
    });

    test(`runs runAcyncOperationWithRunActionExample`, () => {
        runAcyncOperationWithRunActionExample();
        jest.runAllTimers();
    });

    test(`runs runAcyncOperationWithWorkItemExample`, () => {
        runAcyncOperationWithWorkItemExample();
        jest.runAllTimers();
    });

    test(`runs runBasicExample`, () => {
        runBasicExample();
        jest.runAllTimers();
    });

    test(`runs runErrorFlowsExample`, () => {
        runErrorFlowsExample();
        jest.runAllTimers();
    });

    test(`runs runEventWorkflowExample`, () => {
        runEventWorkflowExample();
        jest.runAllTimers();
    });

    test(`runs runModelObserveExample`, () => {
        runModelObserveExample();
        jest.runAllTimers();
    });

    test(`runs runModelRouter`, () => {
        runModelRouter();
        jest.runAllTimers();
    });

    test(`runs runObserveApiBasicExample`, () => {
        runObserveApiBasicExample();
        jest.runAllTimers();
    });

    test(`runs runModelToModelCommunicationsWithEvents`, () => {
        runModelToModelCommunicationsWithEvents();
        jest.runAllTimers();
    });

    test(`runs runModelToModelCommunicationsWithRunAction`, () => {
        runModelToModelCommunicationsWithRunAction();
        jest.runAllTimers();
    });

    test(`runs runModelToModelCommunicationsWithObservables1`, () => {
        runModelToModelCommunicationsWithObservables1();
        jest.runAllTimers();
    });

    test(`runs runModelToModelCommunicationsWithObservables2`, () => {
        runModelToModelCommunicationsWithObservables2();
        jest.runAllTimers();
    });
});