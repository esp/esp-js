import {
    runBasicExample,
    runLifeTimeTypes,
    runInjectionFactories,
    runInjectionFactoriesWithAdditionalDependencies,
    runGroups,
    runResolutionWithAdditionalDependencies,
    runChildContainer,
    runChildContainerRegistrations,
    runDisposal,
    runCustomDependencyResolver,
    runCustomDependencyResolver2,
    runDelegeateResolver,
} from '../examples';

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
    });

    afterAll(()=> {
        console.log = log;
    });

    it(`run example runBasicExample`, () => {
        runBasicExample();
    });

    it(`run example runLifeTimeTypes`, () => {
        runLifeTimeTypes();
    });

    it(`run example runInjectionFactories`, () => {
        runInjectionFactories();
    });

    it(`run example runInjectionFactoriesWithAdditionalDependencies`, () => {
        runInjectionFactoriesWithAdditionalDependencies();
    });

    it(`run example runGroups`, () => {
        runGroups();
    });

    it(`run example runResolutionWithAdditionalDependencies`, () => {
        runResolutionWithAdditionalDependencies();
    });

    it(`run example runChildContainer`, () => {
        runChildContainer();
    });

    it(`run example runChildContainerRegistrations`, () => {
        runChildContainerRegistrations();
    });

    it(`run example runDisposal`, () => {
        runDisposal();
    });

    it(`run example runCustomDependencyResolver`, () => {
        runCustomDependencyResolver();
    });

    it(`run example runCustomDependencyResolver2`, () => {
        runCustomDependencyResolver2();
    });

    it(`run example runDelegeateResolver`, () => {
        runDelegeateResolver();
    });
});