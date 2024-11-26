import {useRouter} from './routerProvider';
import {EspModelContext, useGetModelId} from './espModelContext';
import {useEffect, useState} from 'react';
import {SerialDisposable, utils} from 'esp-js';
import * as React from 'react';

export type ConnectModelToRouterContainerProps = React.PropsWithChildren<{
    modelId?: string;
}>;

export type ConnectModelToRouterContainerChildProps<TModel> = {
    modelId: string;
    model: TModel
};

interface ConnectModelToRouterContainerState {
    model?: any;
    modelSubscriptionDisposable: SerialDisposable;
}

// this would replace connectableComponent.tsx
// it could be used by a versions of connect() (see connect3) if we don't go with connectWithSelector.ts
export const ConnectModelToRouterContainer = ({modelId, children}: ConnectModelToRouterContainerProps) => {
    const router = useRouter();
    const nextModelId = modelId || useGetModelId();
    const [state, setState] = useState<ConnectModelToRouterContainerState>({
        modelSubscriptionDisposable: new SerialDisposable(),
        model: null
    });
    useEffect(() => {
        state.modelSubscriptionDisposable.setDisposable(null);
        if (utils.stringIsEmpty(modelId)) {
            return;
        }
        state.modelSubscriptionDisposable.setDisposable(router
            .getModelObservable(nextModelId)
            .subscribe((model: any) => {
                setState({
                    ...state,
                    model
                });
            })
        );
        return () => {
            state.modelSubscriptionDisposable.dispose();
        };
    }, [router, nextModelId]);
    if (state.model == null) {
        return null;
    }
    // Modern react doesn't really use older Higher Order Component patters such as:
    // * Consume your props, pass everything else down - typically done by extracting '...rest' props and pass them via cloned children.
    // * Pass cross-cutting props through the tree - typically done by massing props via cloned children.
    // However, given this code will work with legacy code it's going to pass some props down, but not '...rest' props.
    // Below, the EspModelContext, will provide a migration path as that exposes data via React context,
    // this will so code can move away from having to pass common props through the tree.
    const childProps: ConnectModelToRouterContainerChildProps<unknown> = { modelId: modelId, model: state.model};
    const childrenWithProps = React.Children.map(children, child => {
        if (React.isValidElement(child)) {
            return React.cloneElement(child, childProps);
        }
        return child;
    });
    return (
        <EspModelContext modelId={nextModelId} router={router} model={state.model}>
            {childrenWithProps}
        </EspModelContext>
    );
};