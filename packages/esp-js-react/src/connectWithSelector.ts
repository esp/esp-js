import {useRouter} from './routerProvider';
import {useGetModelId} from './espModelContext';
import {useMemo} from 'react';
import { Guard } from 'esp-js';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector.js';

export type ConnectEqualityFn<T> = (a: T, b: T) => boolean;

export const defaultConnectEqualityFn = <T>(a: T, b: T) => a === b; // reference equality

export const connectWithSelector = <TModel = unknown, TSelected = unknown>(modelId: string, selector: (model: TModel) => TSelected, equalityFn: ConnectEqualityFn<TModel> = defaultConnectEqualityFn) => {
    Guard.isFunction(selector, 'You must pass a selector function to connectSelector');
    const router = useRouter();
    modelId = modelId || useGetModelId()();
    const dependencies = useMemo(() => {
        // Because of how useSyncExternalStore works, there is an implicit dependency between the subscribe and getSnapshot functions.
        // When the subscription receives the new state from the Router, it can't pass this directly onto getSnapshot, React calls that when it deems it needs to.
        // Given that, we need to cache the state which getSnapshot will return.
        //
        // It's not ideal but shouldn't be a problem as here we've wrapped all these dependent functions inside a single useMemo()
        let cachedModel:TModel = null;
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
                return cachedModel;
            },
            wrappedSelector: (snapshot: TModel) => {
                return selector(snapshot);
            }
        };
    }, [router, modelId, selector]);
    // code for useSyncExternalStoreWithSelector: https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    return useSyncExternalStoreWithSelector(
        dependencies.subscribe,
        dependencies.getSnapshot,
        null,
        dependencies.wrappedSelector,
        equalityFn
    );
};