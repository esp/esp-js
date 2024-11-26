import {useRouter} from './routerProvider';
import {useGetModelId} from './espModelContext';
import {useMemo, useSyncExternalStore} from 'react';
import {Guard} from 'esp-js';
import {useSyncExternalStoreWithSelector} from 'use-sync-external-store/with-selector.js';

export type ConnectEqualityFn<T> = (a: T, b: T) => boolean;

export const defaultConnectEqualityFn = <TSelected>(a: TSelected, b: TSelected) => a === b; // reference equality

export const connectWithSelector = <TModel = unknown, TSelected = unknown>(selector: (model: TModel) => TSelected, modelId?: string, equalityFn: ConnectEqualityFn<TSelected> = defaultConnectEqualityFn) => {
    Guard.isFunction(selector, 'You must pass a selector function to connectSelector');
    const router = useRouter();
    modelId = modelId || useGetModelId();
    const dependencies = useMemo(
        () => {
            // Because of how useSyncExternalStore works, there is an implicit dependency between the subscribe and getSnapshot functions.
            // When the subscription receives the new state from the Router, it can't pass this directly onto getSnapshot, React calls that when it deems it needs to.
            // Given that, we need to cache the state which getSnapshot will return.
            //
            // It's not ideal but shouldn't be a problem as here we've wrapped all these dependent functions inside a single useMemo()
            let cachedModel: TModel = null;
            return {
                subscribe: (stateChanged: () => void) => {
                    const modelSubscriptionDisposable = router
                        .getModelObservable(modelId)
                        .subscribe((model: any) => {
                                cachedModel = model;
                                stateChanged();
                            }
                        );
                    return () => {
                        cachedModel = null;
                        modelSubscriptionDisposable.dispose();
                    };
                },
                getSnapshot: () => {
                    // return selector(cachedModel);
                    let snapshot = cachedModel
                        ? selector(cachedModel)
                        : null;
                    return snapshot;
                },
                // wrappedSelector: (snapshot: TModel) => {
                //     // The first time this renders, react calls getSnapshot and the selector before the router has pushed a change.
                //     // In that case, there is no state for any component to process, therefore, we return null;
                //     let nextState = snapshot
                //         ? selector(snapshot)
                //         : null;
                //     return nextState;
                // }
            };
        },
        // don't cache check against 'selector' argument as that will likely change unless the caller memoize it.
        [router, modelId]
    );
    // code for useSyncExternalStoreWithSelector: https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    return useSyncExternalStore(
        dependencies.subscribe,
        dependencies.getSnapshot,
    );
    // return useSyncExternalStoreWithSelector(
    //     dependencies.subscribe,
    //     dependencies.getSnapshot,
    //     null,
    //     dependencies.wrappedSelector,
    //     equalityFn
    // );
};