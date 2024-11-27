import {useRouter} from './espRouterContext';
import {useGetModelId} from './espModelContext';
import {useMemo, useSyncExternalStore} from 'react';
import {Guard} from 'esp-js';

export const connectWithSelector = <TModel = unknown, TSelected = unknown>(
    selector: (model: TModel) => TSelected,
    modelId?: string
) => {
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
            let cachedSelected: TSelected = null;
            return {
                subscribe: (stateChanged: () => void) => {
                    const modelSubscriptionDisposable = router
                        .getModelObservable(modelId)
                        .subscribe(
                            (nextModel: any) => {
                                // The redux implementation of useSelector caches the store/model here.
                                // Then later does the selection.
                                // For esp, we don't do that as the model isn't immutable.
                                // The selector must do the mutation.
                                // While this isn't ideal, most of the implementations will use esp-js-polimer, which deals with immutable state.
                                // Those selectors will be selecting immutable state from the model and not doing complex re-mappings.
                                // For OO logic (i.e. ConnectableComponent only), the selector must mutate it.
                                // If/when we get rid of ConnectableComponent we can clean this up further.
                                cachedSelected = selector(nextModel);
                                stateChanged();
                            }
                        );
                    return () => {
                        cachedSelected = null;
                        modelSubscriptionDisposable.dispose();
                    };
                },
                getSnapshot: () => {
                    return cachedSelected;
                },
            };
        },
        // Don't cache check against 'selector' argument as that will likely change unless the caller memoizes it.
        [router, modelId]
    );
    // Docs on useSyncExternalStore https://github.com/reactwg/react-18/discussions/86
    // Redux's usage of this (uses useSyncExternalStoreWithSelector variant): https://github.com/reduxjs/react-redux/blob/master/src/hooks/useSelector.ts
    // Code (useSyncExternalStoreWithSelector variant): https://github.com/facebook/react/blob/main/packages/use-sync-external-store/src/useSyncExternalStoreWithSelector.js
    return useSyncExternalStore(
        dependencies.subscribe,
        dependencies.getSnapshot
    );
};