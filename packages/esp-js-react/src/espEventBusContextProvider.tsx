// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import {ModelAddress, EventBus} from 'esp-js';
import {PropsWithChildren, createContext, useContext, useCallback} from 'react';

export const EventBusContext = createContext<EventBus>(null);

/**
 * Get the esp EventBus from context.
 *
 * To use this, please ensure your V-DOM has the EspEventBusContextProvider at a higher node:
 *
 * <EspEventBusContextProvider bus={bus}>
 *     <YourComponents />
 * </EspEventBusContextProvider>
 */
export const useEventBus = () => {
    return useContext(EventBusContext);
};

export type PublishEventDelegate = {(modelIdOrModelAddress: string | ModelAddress, eventType: string, event: any): void; (eventData: { address: string | ModelAddress, eventType: string, event: any }): void; };
const createPublishEvent = (bus: EventBus) => {
    function publishEvent(modelIdOrModelAddress: string | ModelAddress, eventType: string, event: any): void;
    function publishEvent(eventData: { address: string | ModelAddress, eventType: string, event: any }): void;
    function publishEvent(...args: any[]): void {
        if (args.length === 1) {
            bus.publishEvent(args[0].address, args[0].eventType, args[0].event);
        } else {
            bus.publishEvent(args[0], args[1], args[2]);
        }
    }
    return publishEvent;
};
export const PublishEventContext = createContext<PublishEventDelegate>(null);

/**
 * Returns a function which can be used to publish an event.
 *
 * To use this, please ensure your V-DOM has the EspEventBusContextProvider at a higher node:
 *
 * <EspEventBusContextProvider bus={bus}>
 *     <YourComponents />
 * </EspEventBusContextProvider>
 */
export const usePublishEvent = () => useContext(PublishEventContext);

export type EspEventBusContextProviderProps = PropsWithChildren<{ bus: EventBus; }>;

/**
 * Used to set the bus on the EventBusContext making it available to components down the tree via the useEventBus() hook.
 *
 * Also sets up the usePublishEvent() hook so nested components can publish to the bus.
 */
export const EspEventBusContextProvider = ({children, bus}: EspEventBusContextProviderProps) => {
    // EventBus may have been set by a higher level version of this component, so we try and get it from context if it's not set by props.
    let busFromContext = useEventBus();
    bus = bus || busFromContext;
    const publishEvent: PublishEventDelegate = useCallback(createPublishEvent(bus), [bus]);
    return (
        <EventBusContext.Provider value={bus}>
            <PublishEventContext.Provider value={publishEvent}>
                {children}
            </PublishEventContext.Provider>
        </EventBusContext.Provider>
    );
};

/**
 * Used to set the bus on the EventBusContext making it available to components down the tree (via useEventBus()).
 *
 * @deprecated use EspEventBusContextProvider
 */
export const EventBusProvider = EspEventBusContextProvider;

/**
 * Props for EventBusProvider
 *
 * @deprecated use EspEventBusContextProviderProps
 */
export type EventBusProviderProps = EspEventBusContextProviderProps;
