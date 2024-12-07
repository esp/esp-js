import * as React from 'react';
import {DefaultModelAddress, Router, Status, Logger, utils} from 'esp-js';
import {useContext, useCallback, createContext, PropsWithChildren} from 'react';
import {useRouter} from './espRouterContextProvider';

const _log = Logger.create('EspModelContextProvider');

export type GetModelIdDelegate = () => string;
export const GetModelIdContext = createContext<GetModelIdDelegate>(null);
/**
 * Returns a function to get the ID of the model connected at a higher point in the V-DOM.
 *
 * To use this, please ensure your V-DOM has the EspModelContextProvider at a higher node.
 */
export const useGetModelId = () => useContext(GetModelIdContext)();

export type GetModelDelegate = <TModel = any, >() => TModel;
export const GetModelContext = createContext<GetModelDelegate>(null);
/**
 * Returns a function which will return the model connected at a higher point in the V-DOM.
 *
 * To use this, please ensure your V-DOM has the EspModelContextProvider at a higher node.
 */
export const useGetModel = <TModel,>() => useContext(GetModelContext)() as TModel;

export type PublishModelEventDelegate = (eventType: string, event: any) => void;
export const PublishModelEventContext = createContext<PublishModelEventDelegate>(null);
/**
 * Returns a function which can be used to publish an event to the model connected at a higher point in the V-DOM.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the relevant modelId.
 *
 * To use this, please ensure your V-DOM has the EspModelContextProvider at a higher node.
 */
export const usePublishModelEvent = () => useContext(PublishModelEventContext);

export type PublishModelEventWithEntityKeyDelegate = (entityKey: string, eventType: string, event: any) => void;
export const PublishModelEventWithEntityKeyContext = createContext<PublishModelEventWithEntityKeyDelegate>(null);
/**
 * Returns a function which can be used to publish an event to the model connected at a higher point in the V-DOM, allows an entityKey to be specified.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the modelId.
 *
 * To use this, please ensure your V-DOM has the EspModelContextProvider at a higher node.
 */
export const usePublishModelEventWithEntityKey = () => useContext(PublishModelEventWithEntityKeyContext);

export interface EspModelContextProviderProps {
    modelId: string;
    model?: unknown;
}

/**
 * Sets up various ESP context so ESP hooks are available below this point in the V-DOM
 *
 * To use this, please ensure your V-DOM has the EspRouterContextProvider at a higher node.
 * @param modelId
 * @param children
 * @param model
 * @constructor
 */
export const EspModelContextProvider = ({modelId, children, model}: PropsWithChildren<EspModelContextProviderProps>) => {
    const router = useRouter();
    const getModelId: () => string = useCallback(() => {
        return modelId;
    }, [router, modelId]);
    const getModel: () => any = useCallback(() => {
        warnIfModelAccessedOutSideDispatchLoop(router, modelId);
        return model;
    }, [model, router, modelId]);
    const publishModelEvent: PublishModelEventDelegate = useCallback((eventType: string, event: any) => {
        router.publishEvent(modelId, eventType, event);
    }, [router, modelId]);
    const publishModelEventWithEntityKey: PublishModelEventWithEntityKeyDelegate = useCallback((entityKey: string, eventType: string, event: any) => {
        router.publishEvent(new DefaultModelAddress(modelId, entityKey), eventType, event);
    }, [router, modelId]);
    return (
        <GetModelIdContext.Provider value={getModelId}>
            <PublishModelEventContext.Provider value={publishModelEvent}>
                <PublishModelEventWithEntityKeyContext.Provider value={publishModelEventWithEntityKey}>
                    <GetModelContext.Provider value={getModel}>
                        {children}
                    </GetModelContext.Provider>
                </PublishModelEventWithEntityKeyContext.Provider>
            </PublishModelEventContext.Provider>
        </GetModelIdContext.Provider>
    );
};

const warnIfModelAccessedOutSideDispatchLoop = (router: Router, modelId: string) => {
    if (process.env.NODE_ENV === 'production') {
        return;
    }
    if (utils.stringIsEmpty(modelId)) {
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
            `EspModelContextProvider useGetModelId has been invoked outside of the models (${modelId}) dispatch loop. ` +
            `This may have unknown state issues.` +
            stack
        );
    }
};