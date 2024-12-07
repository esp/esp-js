import {useMemo} from 'react';
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector';
import {Guard, utils} from 'esp-js';
import {useRouter} from './espRouterContextProvider';
import {useGetModelId} from './espModelContextProvider';
import {tryGetPolimerImmutableModel} from './polimer/getEspPolimerImmutableModel';

export type ModelSelectorEqualityFn<T> = (last: T, next: T) => boolean;

/**
 * Options affecting the subscription of the model to the Router.
 *
 * Use modelSelectorOptions() to create an instance of this type with sensible defaults.
 *
 * @param modelId - the modelId of the model to be observed via the esp Router.
 * @param tryPreSelectPolimerImmutableModel - if true, and the esp model is an esp-js-polimer model, the immutable model will be used when calling the selector.
 * @param equalityFn - Equality function which will be applied against TSelected, defaults to instance equality (a === b).
 */
export type ModelSelectorOptions<TSelected> = {
    modelId?: string,
    tryPreSelectPolimerImmutableModel: boolean,
    equalityFn: ModelSelectorEqualityFn<TSelected>
};

/**
 * Convenience API to build ModelSelectorOptions<TSelected>, has sensible defaulting.
 */
export interface EditableModelSelectorOptions<TSelected> extends ModelSelectorOptions<TSelected> {
    /**
     * Sets the model ID
     * @param modelId - default if unset: undefined
     */
    setModelId(modelId: string): this;

    /**
     * If the model is a PolimerModel and this set true, PolimerModel.getImmutableModel() will be selected by default.
     * @param value - default if unset: true
     */
    setTryPreSelectPolimerImmutableModel(value: boolean): this;

    /**
     * Equality function used when comparing the last TSelected with the next.
     * @param fn - default if unset: obj instance equality (e.g. a===b)
     */
    setEqualityFn(fn: (a: TSelected, b: TSelected) => boolean): this;
}

/**
 * Convenience API to create ModelSelectorOptions
 */
export const modelSelectorOptions = <TSelected>() => {
    let modelId = undefined;
    let equalityFn: ModelSelectorEqualityFn<TSelected> = (a: TSelected, b: TSelected) => a === b;
    let tryPreSelectPolimerImmutableModel = true;
    return {
        get modelId() {
            return modelId;
        },
        setModelId(value: string) {
            modelId = value;
            return this;
        },
        get equalityFn() {
            return equalityFn;
        },
        setEqualityFn(value: ModelSelectorEqualityFn<TSelected>) {
            equalityFn = value;
            return this;
        },
        get tryPreSelectPolimerImmutableModel() {
            return tryPreSelectPolimerImmutableModel;
        },
        setTryPreSelectPolimerImmutableModel(value: boolean) {
            tryPreSelectPolimerImmutableModel = value;
            return this;
        }
    } as EditableModelSelectorOptions<TSelected>;
};

/**
 * A hook which returns model state from the esp Router.
 *
 * This hooks wih observe updates and re-render the component if the model changes.
 *
 * To use this, please ensure your V-DOM has the EspRouterContextProvider at a higher node, and optionally EspModelContextProvider.
 *
 * @param selector - a function to select a selection of the model - the selector does not need to be memoized, this selector will be cached against the modelId.
 * @param options
 */
export type UseModelSelector = <TModel, TSelected>(
    selector: (model: TModel) => TSelected,
    options?: ModelSelectorOptions<TSelected>
) => TSelected;

export const useModelSelector: UseModelSelector = <TModel, TSelected>(
    selector: (model: TModel) => TSelected,
    options: ModelSelectorOptions<TSelected> = modelSelectorOptions<TSelected>()
) => {
    Guard.isFunction(selector, 'You must pass a selector function to connectSelector');
    const router = useRouter();
    const modelId = options?.modelId || useGetModelId();
    const tryPreSelectPolimerImmutableModel = options?.tryPreSelectPolimerImmutableModel;
    const equalityFn = options?.equalityFn;
    const dependencies = useMemo(
        () => {
            // Because of how useSyncExternalStore works, there is an implicit dependency between the subscribe and getSnapshot functions.
            // When the subscription receives the new state from the Router, it can't pass this directly onto getSnapshot, React calls that when it deems it needs to.
            // Given that, we need to cache the state which getSnapshot will return.
            //
            // It's not ideal but shouldn't be a problem as here we've wrapped all these dependent functions inside a single useMemo()
            let model: TModel = null;
            return {
                subscribe: (stateChanged: () => void) => {
                    const modelSubscriptionDisposable = router
                        .getModelObservable(modelId)
                        .subscribe(
                            (m: any) => {
                                // try and get a submodel to render
                                const nextModel = tryPreSelectPolimerImmutableModel
                                    ? tryGetPolimerImmutableModel(m)
                                    : m;
                                // if the above didn't manage to get a submodel,
                                // we need to mutate to force useSyncExternalStoreWithSelector to pick up the change
                                model = nextModel === m
                                    ? Object.create(nextModel)
                                    : nextModel;
                                stateChanged();
                            }
                        );
                    return () => {
                        model = null;
                        modelSubscriptionDisposable.dispose();
                    };
                },
                // React expects getSnapshot to be immutable, it'll only re-render if the instance changes
                getSnapshot: () => {
                    return model;
                },
                // While getSnapshot needs to model to be immutable,
                // useSyncExternalStoreWithSelector builds on top of this, so the TSelected can defer to an equality check to determine if the change is propagated.
                // The selector here just maps the TSelected, useSyncExternalStoreWithSelector internally does the equality check.
                wrappedSelector: (snapshot: TModel) => {
                    // The first time this renders, react calls getSnapshot and the selector before the router has pushed a change.
                    // In that case, there is no state for any component to process, therefore, we return null;
                    return snapshot
                        ? selector(snapshot)
                        : null;
                }
            };
        },
        // Don't cache check against 'selector' argument as that will likely change unless the caller memoizes it.
        [router, modelId]
    );

    // If we don't have a modelId, we still need to return a hook so React doesn't complain.
    // Additionally, we need to let the above expiration (dependencies) run to unsubscribe from any previous subscription.
    if (utils.stringIsEmpty(modelId)) {
        return useSyncExternalStoreWithSelector(
            noopSubscription.subscribe,
            noopSubscription.getSnapshot,
            undefined,
            noopSubscription.wrappedSelector,
            equalityFn
        );
    }

    // Docs on useSyncExternalStore https://github.com/reactwg/react-18/discussions/86
    // Redux's usage of this: https://github.com/reduxjs/react-redux/blob/master/src/hooks/useSelector.ts
    // Code: https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    return useSyncExternalStoreWithSelector(
        dependencies.subscribe,
        dependencies.getSnapshot,
        undefined,
        dependencies.wrappedSelector,
        equalityFn,
    );
};

const noopSubscription = {
    subscribe: () => { },
    getSnapshot: () => null,
    wrappedSelector: () => true
};