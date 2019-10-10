///////////////////////// example bootstrap code /////////////////
// Call one of the functions above via the prompt setup below
//////////////////////////////////////////////////////////////////

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
    runModelToModelCommunicationsWithObservables2
} from './app';
import * as prompt from 'prompt';

let examples = {
    '1': {description: 'Basic Example', action: runBasicExample},
    '2': {description: 'Event Workflow', action: runEventWorkflowExample},
    '3': {description: 'Model Observe', action: runModelObserveExample},
    '4': {description: 'Observable Api', action: runObserveApiBasicExample},
    '5': {description: 'Model to model communications with events', action: runModelToModelCommunicationsWithEvents},
    '6': {description: 'Model to model communications with runAction', action: runModelToModelCommunicationsWithRunAction},
    '7': {description: 'Model to model communications with observables (Unique Request -> Many Responses)', action: runModelToModelCommunicationsWithObservables1},
    '8': {description: 'Model to model communications with observables (streaming)', action: runModelToModelCommunicationsWithObservables2},
    '9': {description: 'Async operation with work item', action: runAcyncOperationWithWorkItemExample},
    '10': {description: 'Async operation with run action', action: runAcyncOperationWithRunActionExample},
    '11': {description: 'Single model routers', action: runModelRouter},
    '12': {description: 'Error flows example', action: runErrorFlowsExample}
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