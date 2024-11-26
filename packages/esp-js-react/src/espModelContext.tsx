import * as React from 'react';
import {DefaultModelAddress, ModelAddress, Router, Status, Logger} from 'esp-js';
import {useContext, useCallback, createContext, PropsWithChildren} from 'react';
import {RouterContext} from './routerProvider';

const _log = Logger.create('EspModelContext');

export type GetModelIdDelegate = () => string;
export const GetModelIdContext = createContext<GetModelIdDelegate>(null);
/**
 * Returns a function which will return the ID of the model currently being rendered.
 */
export const useGetModelId = () => useContext(GetModelIdContext)();

export type GetModelDelegate = <TModel = any,>() => TModel;
export const GetModelContext = createContext<GetModelDelegate>(null);
/**
 * Returns a function which will return the model set at last dispatch.
 */
export const useGetModel = () => useContext(GetModelContext)();

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

export interface EspModelContextProps {
    modelId: string;
    router: Router;
    model?: unknown;
}

export const EspModelContext = ({modelId, children, router, model}: PropsWithChildren<EspModelContextProps>) => {
    const getModelId: () => string = useCallback(() => {
        return modelId;
    }, [router, modelId]);
    const getModel: () => any = useCallback(() => {
        warnIfModelAccessedOutSideDispatchLoop(router, modelId, model);
        return model;
    }, [model, router, modelId]);
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
        <RouterContext.Provider value={router}>
            <GetModelIdContext.Provider value={getModelId}>
                <PublishEventContext.Provider value={publishEvent}>
                    <PublishModelEventContext.Provider value={publishModelEvent}>
                        <PublishModelEventWithEntityKeyContext.Provider value={publishModelEventWithEntityKey}>
                            <GetModelContext.Provider value={getModel}>
                                {children}
                            </GetModelContext.Provider>
                        </PublishModelEventWithEntityKeyContext.Provider>
                    </PublishModelEventContext.Provider>
                </PublishEventContext.Provider>
            </GetModelIdContext.Provider>
        </RouterContext.Provider>
    );
};

const warnIfModelAccessedOutSideDispatchLoop = (router: Router, modelId: string, model: any) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (!model) {
        return;
    }
    let isDispatchModelUpdateStatus = router.isModelDispatchStatus(modelId, Status.DispatchModelUpdates);
    if (!isDispatchModelUpdateStatus) {
        let stack: string | undefined = undefined;
        try {
            // noinspection ExceptionCaughtLocallyJS
            throw new Error();
        } catch (e) {
            stack = (e as Error).stack;
        }
        _log.warn(
            `EspModelContext useGetModelId has been invoked outside of the models (${modelId}) dispatch loop.` +
            `This may have unknown state state issues.` +
            stack
        );
    }
};