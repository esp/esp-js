import {DefaultStoreAddress, EventBus} from 'esp-js';
import {useContext, useCallback, createContext, PropsWithChildren} from 'react';
import {useEventBus} from './espEventBusContextProvider';

export const GetStoreIdContext = createContext<string>(null);
/**
 * Returns a function to get the ID of the store connected at a higher point in the V-DOM.
 *
 * To use this, please ensure your V-DOM has the EspStoreContextProvider at a higher node.
 */
export const useGetStoreId = () => useContext(GetStoreIdContext);

export const GetStoreContext = createContext<object>(null);
/**
 * Returns a function which will return the store connected at a higher point in the V-DOM.
 *
 * To use this, please ensure your V-DOM has the EspStoreContextProvider at a higher node.
 */
export const useGetStore = <TModel,>() => useContext(GetStoreContext) as TModel;

export type PublishStoreEventDelegate = { (eventType: string, event: any): void; (eventData: {eventType: string, event: any}): void; };
const createPublishStoreEvent = (bus: EventBus, storeId: string) => {
    function publishStoreEvent(eventType: string, event: any): void;
    function publishStoreEvent(eventData: {eventType: string, event: any}): void;
    function publishStoreEvent(...args: any[]) {
        if (args.length === 1) {
            bus.publishEvent(storeId, args[0].eventType, args[0].event);
        } else {
            bus.publishEvent(storeId, args[0], args[1]);
        }
    }
    return publishStoreEvent;
};
export const PublishStoreEventContext = createContext<PublishStoreEventDelegate>(null);

/**
 * Returns a function which can be used to publish an event to the store connected at a higher point in the V-DOM.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the relevant storeId.
 *
 * To use this, please ensure your V-DOM has the EspStoreContextProvider at a higher node.
 */
export const usePublishStoreEvent = () => useContext(PublishStoreEventContext);

export type PublishStoreEventWithEntityKeyDelegate = {(entityKey: string, eventType: string, event: any): void; (eventData: {entityKey: string, eventType: string, event: any}): void; };
const createPublishStoreEventWithEntityKey = (bus: EventBus, storeId: string) => {
    function publishStoreEventWithEntityKey(entityKey: string, eventType: string, event: any): void;
    function publishStoreEventWithEntityKey(eventData: {entityKey: string, eventType: string, event: any}): void;
    function publishStoreEventWithEntityKey(...args: any[]) {
        if (args.length === 1) {
            bus.publishEvent(new DefaultStoreAddress(storeId, args[0].entityKey), args[0].eventType, args[0].event);
        } else {
            bus.publishEvent(new DefaultStoreAddress(storeId, args[0]), args[1], args[2]);
        }
    }
    return publishStoreEventWithEntityKey;
};
export const PublishStoreEventWithEntityKeyContext = createContext<PublishStoreEventWithEntityKeyDelegate>(null);
/**
 * Returns a function which can be used to publish an event to the store connected at a higher point in the V-DOM, allows an entityKey to be specified.
 *
 * Effectively, this is a version of usePublishEvent() which closes over the storeId.
 *
 * To use this, please ensure your V-DOM has the EspStoreContextProvider at a higher node.
 */
export const usePublishStoreEventWithEntityKey = () => useContext(PublishStoreEventWithEntityKeyContext);

export interface EspStoreContextProviderProps {
    storeId: string;
    model?: any;
}

/**
 * Sets up various ESP context so ESP hooks are available below this point in the V-DOM
 *
 * To use this, please ensure your V-DOM has the EspEventBusContextProvider at a higher node.
 * @param storeId
 * @param children
 * @param model
 * @constructor
 */
export const EspStoreContextProvider = ({storeId, children, model}: PropsWithChildren<EspStoreContextProviderProps>) => {
    const bus = useEventBus();
    // storeId may have been set by a higher level version of this component, so we try and get it from context if it's not set by props.
    let storeIdFromContext = useGetStoreId();
    storeId = storeId || storeIdFromContext;
    const publishStoreEvent: PublishStoreEventDelegate = useCallback(createPublishStoreEvent(bus, storeId), [bus, storeId]);
    const publishStoreEventWithEntityKey: PublishStoreEventWithEntityKeyDelegate = useCallback(createPublishStoreEventWithEntityKey(bus, storeId), [bus, storeId]);
    return (
        <GetStoreIdContext.Provider value={storeId}>
            <PublishStoreEventContext.Provider value={publishStoreEvent}>
                <PublishStoreEventWithEntityKeyContext.Provider value={publishStoreEventWithEntityKey}>
                    <GetStoreContext.Provider value={model}>
                        {children}
                    </GetStoreContext.Provider>
                </PublishStoreEventWithEntityKeyContext.Provider>
            </PublishStoreEventContext.Provider>
        </GetStoreIdContext.Provider>
    );
};
