import {useMemo} from 'react';
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector';
import {Logger, EventBus, utils} from 'esp-js';
import {useEventBus} from './espEventBusContextProvider';
import {useGetStoreId} from './espStoreContextProvider';

export type SyncStoreModelWithSelectorEqualityFn<T> = (last: T, next: T) => boolean;

export const logger = Logger.create('useSyncStoreModelWithSelector');

/**
 * Options affecting the subscription of the model to the EventBus.
 *
 * Use syncStoreModelWithSelectorOptions() to create an instance of this type with sensible defaults.
 *
 * @param storeId - the storeId of the store to be observed via the esp EventBus.
 * @param equalityFn - Equality function which will be applied against TSelected, defaults to instance equality (a === b).
 */
export type SyncStoreModelWithSelectorOptions<TSelected> = {
    storeId?: string,
    equalityFn: SyncStoreModelWithSelectorEqualityFn<TSelected>
};

/**
 * Convenience API to build SyncStoreModelWithSelectorOptions<TSelected>, has sensible defaulting.
 */
export interface SyncStoreModelWithSelectorOptionsBuilder<TSelected> extends SyncStoreModelWithSelectorOptions<TSelected> {
    /**
     * Sets the store ID
     * @param storeId - default if unset: undefined
     */
    setStoreId(storeId: string): this;

    /**
     * Equality function used when comparing the last TSelected with the next.
     * @param fn - default if unset: obj instance equality (e.g. a===b)
     */
    setEqualityFn(fn: (a: TSelected, b: TSelected) => boolean): this;
}

/**
 * Convenience API to create SyncStoreModelWithSelectorOptions
 */
export const syncStoreModelWithSelectorOptions = <TSelected>() => {
    let storeId = undefined;
    let equalityFn: SyncStoreModelWithSelectorEqualityFn<TSelected> = (a: TSelected, b: TSelected) => a === b;
    return {
        get storeId() {
            return storeId;
        },
        setStoreId(value: string) {
            storeId = value;
            return this;
        },
        get equalityFn() {
            return equalityFn;
        },
        setEqualityFn(value: SyncStoreModelWithSelectorEqualityFn<TSelected>) {
            equalityFn = value;
            return this;
        }
    } as SyncStoreModelWithSelectorOptionsBuilder<TSelected>;
};

const checkArguments = (selector: (model: any) => any, options: SyncStoreModelWithSelectorOptions<any> ) => {
    if (!utils.isFunction(selector)) {
        throw new Error('You must pass a selector function to useSyncStoreModelWithSelector');
    }
    if (!utils.isObject(options)) {
        throw new Error('You must provide options when using useSyncStoreModelWithSelector');
    }
    if (!utils.isFunction(options.equalityFn)) {
        throw new Error('You must provide an equalityFn when using useSyncStoreModelWithSelector');
    }
};

/**
 * A hook which returns model state from the esp EventBus.
 *
 * This hooks wih observe updates and re-render the component if the model changes.
 *
 * To use this, please ensure your V-DOM has the EspEventBusContextProvider at a higher node, and optionally EspStoreContextProvider.
 *
 * @param selector - a function to select a selection of the model - the selector does not need to be memoized, this selector will be cached against the storeId.
 * @param options
 */
export const useSyncStoreModelWithSelector = <TModel, TSelected>(
    selector: (model: TModel) => TSelected,
    options: SyncStoreModelWithSelectorOptions<TSelected> = syncStoreModelWithSelectorOptions<TSelected>()
): TSelected => {
    checkArguments(selector, options);
    const bus = useEventBus();
    const storeIdFromContext = useGetStoreId();
    const storeId = options?.storeId || storeIdFromContext;
    const equalityFn = options?.equalityFn;
    const dependencies = useMemo(
        () => {
            const canSubscribe = bus && utils.isString(storeId) && bus.isStoreRegistered(storeId);
            if (canSubscribe) {
                return createSubscriptionState(bus, storeId, selector);
            }
            return createNoopSubscriptionState();
        },
        // Don't add 'selector' to the dependency list as that will likely change unless the caller memoizes it.
        [bus, storeId]
    );

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

const createSubscriptionState = <TModel, TSelected>(
    bus: EventBus,
    storeId: string,
    selector: (model: TModel) => TSelected,
) => {
    // Because of how useSyncExternalStore works, there is an implicit dependency between the subscribe and getSnapshot functions.
    // When the subscription receives the new state from the EventBus, it can't pass this directly onto getSnapshot,
    // React calls that when it deems it needs to.
    // Given that, we need to cache the state which getSnapshot will return.
    //
    // Note: the bus subscription is created inside the `subscribe` callback (not here at factory time).
    // This is important for correctness with React StrictMode: StrictMode intentionally unmounts and remounts
    // components to surface side-effect bugs.  When the cleanup returned by `subscribe` is called, it disposes
    // the bus subscription and clears `currentModel`.  Because the `dependencies` object created by useMemo is
    // reused across the remount (deps haven't changed), any bus subscription created eagerly at useMemo time
    // would already be disposed on remount, leaving `currentModel` permanently null.
    //
    // useSyncExternalStore guarantees that `getSnapshot` is called before `subscribe`, so we initialise
    // `currentModel` lazily from `bus.getStoreModel()` inside `getSnapshot` when it is still null.
    let currentModel: TModel;
    return {
        subscribe: (stateChanged: () => void) => {
            // Subscribe to future model updates from the EventBus.
            // This is called by React when the component mounts (and remounts after StrictMode teardown).
            const modelSubscriptionDisposable = bus
                .getStoreModelObservable<TModel>(storeId)
                .subscribe(
                    (m: TModel) => {
                        // The model is a frozen immutable snapshot produced by immer after each dispatch cycle.
                        // immer only creates a new reference when something changed, so the same reference means no change.
                        // This also covers the replay of the current model when we subscribe, which getSnapshot() already returned.
                        if (m === currentModel) {
                            return;
                        }
                        currentModel = m;
                        stateChanged();
                    }
                );
            return () => {
                currentModel = null;
                modelSubscriptionDisposable.dispose();
            };
        },
        // React expects getSnapshot to be pure and stable between renders unless the store has changed.
        // We seed currentModel from bus.getStoreModel() on first call (before subscribe has been called),
        // then keep it up-to-date via the subscription callback above.
        getSnapshot: () => {
            if (currentModel == null) {
                currentModel = bus.getStoreModel<TModel>(storeId);
            }
            return currentModel;
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
