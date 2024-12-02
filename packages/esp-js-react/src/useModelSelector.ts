import {useMemo} from 'react';
import { useSyncExternalStoreWithSelector } from 'use-sync-external-store/with-selector';
import {Guard} from 'esp-js';
import {useRouter} from './espRouterContext';
import {useGetModelId} from './espModelContext';
import {tryGetRenderModel} from './polimer/getEspReactRenderModel';

export const defaultConnectEqualityFn = <TSelected>(a: TSelected, b: TSelected) => a === b; // reference equality

export type ConnectEqualityFn<T> = (last: T, next: T) => boolean;

/**
 * A hook which returns model state from the esp Router.
 *
 * This hooks wih observe updates and re-render the component if the model changes.
 *
 * @param selector - a function to select a selection of the model - the selector does not need to be memoized, this selector will be cached against the modelId.
 * @param modelId - the modelId of the model to be observed via the esp Router.
 * @param tryPreSelectPolimerImmutableModel - if true, and the esp model is an esp-js-polimer model, the immutable model will be used when calling the selector.
 * @param equalityFn - Equality function which will be applied against TSelected, defaults to instance equality (a === b).
 */
export const useModelSelector = <TModel = unknown, TSelected = unknown>(
    selector: (model: TModel) => TSelected,
    modelId?: string,
    tryPreSelectPolimerImmutableModel: boolean = true,
    equalityFn: ConnectEqualityFn<TSelected> = defaultConnectEqualityFn
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
            let model: TModel = null;
            return {
                subscribe: (stateChanged: () => void) => {
                    const modelSubscriptionDisposable = router
                        .getModelObservable(modelId)
                        .subscribe(
                            (m: any) => {
                                // try and get a submodel to render
                                const nextModel = tryPreSelectPolimerImmutableModel
                                    ? tryGetRenderModel(m)
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

                // TODO confirm this comment with a test:

                // useSyncExternalStoreWithSelector builds on top of this so the TSelected can defer to an equality check to determine if the change is propagated.
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