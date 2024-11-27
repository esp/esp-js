import {useRouter} from './espRouterContext';
import {useGetModelId} from './espModelContext';
import {useMemo, useSyncExternalStore} from 'react';
import {Guard} from 'esp-js';

export type ConnectEqualityFn<T> = (last: T, next: T) => boolean;

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
            let snapshot: TSelected = null;
            return {
                subscribe: (stateChanged: () => void) => {
                    const modelSubscriptionDisposable = router
                        .getModelObservable(modelId)
                        .subscribe(
                            (model: any) => {

                                const nextSnapshot = selector(model);
                                if (!equalityFn(snapshot, nextSnapshot)) {
                                    snapshot = nextSnapshot;
                                    stateChanged();
                                }
                            }
                        );
                    return () => {
                        snapshot = null;
                        modelSubscriptionDisposable.dispose();
                    };
                },
                getSnapshot: () => {
                    return snapshot;
                },
            };
        },
        // don't cache check against 'selector' argument as that will likely change unless the caller memoize it.
        [router, modelId]
    );
    // Note, originally I did this selection logic based on
    // useSyncExternalStoreWithSelector: https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    // However, I couldn't get that to work.
    // It seemed that it was ignoring the equalityFunction I passed in to it.
    // If I generated a new equalityFunction each time (with same a === b implementation), it worked.
    // I suspect there is some issues with it memo-ing something incorrectly, or perhaps in how I'm using it.
    // It's not a documented React API, but it is what react-redux is using.
    // All that said, I'm just doing a similar selection and equality checking above, it seems to be working as expected.
    return useSyncExternalStore(
        dependencies.subscribe,
        dependencies.getSnapshot,
    );
};