///////////////////////// example bootstrap code /////////////////
// Call one of the functions above via the prompt setup below
//////////////////////////////////////////////////////////////////

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
} from './examples';
import * as prompt from 'prompt';

let examples = {
    '1': {description: 'Basic Example', action: runBasicExample},
    '2': {description: 'Lifetime Types', action: runLifeTimeTypes},
    '3': {description: 'Injection factories', action: runInjectionFactories},
    '4': {description: 'Injection Factories with additional dependencies', action: runInjectionFactoriesWithAdditionalDependencies},
    '5': {description: 'Resolve group', action: runGroups},
    '6': {description: 'Resolve with additional dependencies', action: runResolutionWithAdditionalDependencies},
    '7': {description: 'Child Containers', action: runChildContainer},
    '8': {description: 'Child container with registration overrides', action: runChildContainerRegistrations},
    '9': {description: 'Container disposal', action: runDisposal},
    '10': {description: 'Custom resolvers', action: runCustomDependencyResolver},
    '11': {description: 'Custom resolvers 2', action: runCustomDependencyResolver2},
    '12': {description: 'Delegate resolvers', action: runDelegeateResolver}
};

console.log('Which sample do you want to run (enter a number)?');
for (let exampleKey in examples) {
    if (examples.hasOwnProperty(exampleKey)) {
        console.log('%s - %s', exampleKey, examples[exampleKey].description);
    }
}

let properties = [
    {
        name: 'sampleNumber',
        validator: /^[1-9].*$/,
        warning: 'Sample number must be a number between 1-12 inclusive'
    }
];

prompt.start();

prompt.get(properties, function (err, result) {
    if (err) {
        return onErr(err);
    }
    let example = examples[result.sampleNumber];
    if (!example) {
        console.error('Can\'t find sample with number %s\'', result.sampleNumber);
        return;
    }
    console.log('Running sample \'%s\'', example.description);
    examples[result.sampleNumber].action();
});

function onErr(err) {
    console.log(err);
    return 1;
}