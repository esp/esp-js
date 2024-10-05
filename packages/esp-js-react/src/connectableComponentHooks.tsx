import * as React from 'react';
import {DefaultModelAddress, ModelAddress} from 'esp-js';
import {useContext, useCallback, createContext, PropsWithChildren} from 'react';
import {useRouter} from './routerProvider';

export type GetModelIdDelegate = () => string;
export const GetModelIdContext = createContext<GetModelIdDelegate>(null);
/**
 * Returns a function which will return the ID of the model currently being rendered.
 */
export const useGetModelId = () => useContext(GetModelIdContext);

export type PublishEventDelegate = (modelIdOrModelAddress: string | ModelAddress, eventType: string, event: any) => void;
export const PublishEventContext = createContext<PublishEventDelegate>(null);
/**
 * Returns a function which can be used to publish an event.
 */
export const usePublishEvent = () => useContext(PublishEventContext);

export type PublishModelEventDelegate = (eventType: string, event: any) => void;
export const PublishModelEventContext = createContext<PublishModelEventDelegate>(null);
/**
 * Returns a function which can be used to publish an event to the current model being rendered.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the current modelId.
 */
export const usePublishModelEvent = () => useContext(PublishModelEventContext);

export type PublishModelEventWithEntityKeyDelegate = (entityKey: string, eventType: string, event: any) => void;
export const PublishModelEventWithEntityKeyContext = createContext<PublishModelEventWithEntityKeyDelegate>(null);
/**
 * Returns a function which can be used to publish an event to the current model being rendered, allows an entityKey to be specified.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the current modelId.
 */
export const usePublishModelEventWithEntityKey = () => useContext(PublishModelEventWithEntityKeyContext);

export interface ConnectableComponentHooksProps {
    modelId: string;
}

export const ConnectableComponentHooks = ({modelId, children}: PropsWithChildren<ConnectableComponentHooksProps>) => {
    const router = useRouter();
    const getModelId: () => string = useCallback(() => {
        return modelId;
    }, [router, modelId]);
    const publishEvent: PublishEventDelegate = useCallback((modelIdOrModelAddress: string, eventType: string, event: any) => {
        router.publishEvent(modelIdOrModelAddress, eventType, event);
    }, [router]);
    const publishModelEvent: PublishModelEventDelegate = useCallback((eventType: string, event: any) => {
        router.publishEvent(modelId, eventType, event);
    }, [router, modelId]);
    const publishModelEventWithEntityKey: PublishModelEventWithEntityKeyDelegate = useCallback((entityKey: string, eventType: string, event: any) => {
        router.publishEvent(new DefaultModelAddress(modelId, entityKey), eventType, event);
    }, [router, modelId]);
    return (
        <GetModelIdContext.Provider value={getModelId}>
            <PublishEventContext.Provider value={publishEvent}>
                <PublishModelEventContext.Provider value={publishModelEvent}>
                    <PublishModelEventWithEntityKeyContext.Provider value={publishModelEventWithEntityKey}>
                        {children}
                    </PublishModelEventWithEntityKeyContext.Provider>
                </PublishModelEventContext.Provider>
            </PublishEventContext.Provider>
        </GetModelIdContext.Provider>
    );
};