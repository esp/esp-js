import {utils} from 'esp-js';

export const GetEspPolimerImmutableModelFunctionName = 'getEspPolimerImmutableModel';

/**
 * Returns the model which will be used to pluck state/props for the current view.
 *
 * This is basically a hook (not a React 'hook') to call a function on `model` and get a new subgraph to use as state.
 *
 */
export const getPolimerImmutableModel = <TImmutableModel>(model: any): TImmutableModel => {
    // else see if there is a function with name GetEspPolimerImmutableModelConsts.HandlerFunctionName we can invoke to get a different model to render?
    let immutableModel = model[GetEspPolimerImmutableModelFunctionName];
    return immutableModel.call(model);
};

export const hasPolimerImmutableModel = <TImmutableModel>(model: any): boolean => {
    // else see if there is a function with name GetEspPolimerImmutableModelConsts.HandlerFunctionName we can invoke to get a different model to render?
    let getImmutableModelFn = model[GetEspPolimerImmutableModelFunctionName];
    if (getImmutableModelFn && utils.isFunction(getImmutableModelFn)) {
        return true;
    }
    // else return the initial model passed in
    return false;
};