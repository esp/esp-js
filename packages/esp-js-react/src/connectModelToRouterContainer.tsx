import {useRouter} from './routerProvider';
import {EspModelContext, useGetModelId} from './espModelContext';
import {useEffect, useState} from 'react';
import {SerialDisposable, utils} from 'esp-js';
import * as React from 'react';

export type ConnectModelToRouterContainerProps<TModel> = React.PropsWithChildren<{
    modelId?: string;
    [key: string]: any;  // ...rest props, including the result of mapPublish and mapPublish if 'connect' was used
}>;

interface ConnectModelToRouterContainerState {
    model?: any;
    modelSubscriptionDisposable: SerialDisposable;
}

export const ConnectModelToRouterContainer = <TModel,>({modelId, children, ...rest}: ConnectModelToRouterContainerProps<TModel>) => {
    const router = useRouter();
    const nextModelId = modelId || useGetModelId()();
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
    return (
        <EspModelContext modelId={nextModelId} router={router} {...rest}>
            {children}
        </EspModelContext>
    );
};