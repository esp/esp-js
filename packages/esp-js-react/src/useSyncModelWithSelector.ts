import {useMemo} from 'react';
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector';
import {Router, utils} from 'esp-js';
import {useRouter} from './espRouterContextProvider';
import {useGetModelId} from './espModelContextProvider';
import {tryGetPolimerImmutableModel} from './polimer/getEspPolimerImmutableModel';

export type SyncModelWithSelectorEqualityFn<T> = (last: T, next: T) => boolean;

/**
 * Options affecting the subscription of the model to the Router.
 *
 * Use syncModelWithSelectorOptions() to create an instance of this type with sensible defaults.
 *
 * @param modelId - the modelId of the model to be observed via the esp Router.
 * @param tryPreSelectPolimerImmutableModel - if true, and the esp model is an esp-js-polimer model, the immutable model will be used when calling the selector.
 * @param equalityFn - Equality function which will be applied against TSelected, defaults to instance equality (a === b).
 */
export type SyncModelWithSelectorOptions<TSelected> = {
    modelId?: string,
    tryPreSelectPolimerImmutableModel: boolean,
    equalityFn: SyncModelWithSelectorEqualityFn<TSelected>
};

/**
 * Convenience API to build SyncModelWithSelectorOptions<TSelected>, has sensible defaulting.
 */
export interface SyncModelWithSelectorOptionsBuilder<TSelected> extends SyncModelWithSelectorOptions<TSelected> {
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
 * Convenience API to create SyncModelWithSelectorOptions
 */
export const syncModelWithSelectorOptions = <TSelected>() => {
    let modelId = undefined;
    let equalityFn: SyncModelWithSelectorEqualityFn<TSelected> = (a: TSelected, b: TSelected) => a === b;
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
        setEqualityFn(value: SyncModelWithSelectorEqualityFn<TSelected>) {
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
    } as SyncModelWithSelectorOptionsBuilder<TSelected>;
};

const checkArguments = (selector: (model: any) => any, options: SyncModelWithSelectorOptions<any> ) => {
    if (!utils.isFunction(selector)) {
        throw new Error('You must pass a selector function to useSyncModelWithSelector');
    }
    if (!utils.isObject(options)) {
        throw new Error('You must provide options when using useSyncModelWithSelector');
    }
    if (!utils.isFunction(options.equalityFn)) {
        throw new Error('You must provide an equalityFn when using useSyncModelWithSelector');
    }
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
export const useSyncModelWithSelector = <TModel, TSelected>(
    selector: (model: TModel) => TSelected,
    options: SyncModelWithSelectorOptions<TSelected> = syncModelWithSelectorOptions<TSelected>()
): TSelected => {
    checkArguments(selector, options);
    const router = useRouter();
    const modelIdFromContext = useGetModelId();
    const modelId = options?.modelId || modelIdFromContext;
    const tryPreSelectPolimerImmutableModel = options?.tryPreSelectPolimerImmutableModel;
    const equalityFn = options?.equalityFn;
    const dependencies = useMemo(
        () => {
            const canSubscribe = router && utils.isString(modelId) && router.isModelRegistered(modelId);
            if (canSubscribe) {
                return createSubscriptionState(router, modelId, selector, tryPreSelectPolimerImmutableModel);
            }
            return createNoopSubscriptionState();
        },
        // Don't add 'selector' to the dependency list as that will likely change unless the caller memoizes it.
        [router, modelId]
    );

    // Docs on useSyncExternalStore https://github.com/reactwg/react-18/discussions/86
    // Redux's usage of this: https://github.com/reduxjs/react-redux/blob/master/src/hooks/useSelector.ts
    // Code: https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    return useSyncExternalStoreWithSelector(
        dependencies.subscribe,
        dependencies.getSnapshot,
        undefined,
        dependencies.wrappedSelector,
        // equalityFn can't be cached (needs to be a new fn each time)
        // It seems that if it is, you get the last value regardless of if dependencies (and it's associated functions) changes.
        equalityFn,
    );
};

const createSubscriptionState = <TModel, TSelected>(
    router: Router,
    modelId: string,
    selector: (model: TModel) => TSelected,
    tryPreSelectPolimerImmutableModel: boolean
) => {
    // Because of how useSyncExternalStore works, there is an implicit dependency between the subscribe and getSnapshot functions.
    // When the subscription receives the new state from the Router, it can't pass this directly onto getSnapshot,
    // React calls that when it deems it needs to.
    // Given that, we need to cache the state which getSnapshot will return.
    //
    // Another edge case with useSyncExternalStore:
    // It will call getSnapshot before it calls subscribe, to account for this we need to fetch the model first.
    // ESP will always dispatch the model when you initially observe it, because we pre-fetched it, the first updated is ignored below.
    const selectModelOrPolimerModel = (m: any): TModel => {
        // try use get the esp-js-polimer immutable model if possible.
        const nextModel = tryPreSelectPolimerImmutableModel
            ? tryGetPolimerImmutableModel(m)
            : m;
        // If the above didn't manage to get a polimer model,
        // we need to mutate to force useSyncExternalStoreWithSelector to pick up the change.
        // This should only affect older style OO models.
        let modelHasNotMutated = nextModel === m;
        return modelHasNotMutated
            ? Object.create(nextModel)
            : nextModel;
    };
    let isFirstRun = true;
    let model: TModel = selectModelOrPolimerModel(router.getModel(modelId));
    return {
        subscribe: (stateChanged: () => void) => {
            const modelSubscriptionDisposable = router
                .getModelObservable<TModel>(modelId)
                .map(m => selectModelOrPolimerModel(m))
                .subscribe(
                    (m: any) => {
                        if (isFirstRun) {
                            isFirstRun = false;
                            return;
                        }
                        model = m;
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
            return snapshot
                ? selector(snapshot)
                : null;
        }
    };
};

const createNoopSubscriptionState = () => ({
    subscribe: () => {
        return () => {};
    },
    getSnapshot: () => null,
    wrappedSelector: () => null
});