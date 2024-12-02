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

import * as React from 'react';
import {ModelAddress, Router} from 'esp-js';
import {PropsWithChildren, createContext, useContext, useCallback} from 'react';

export const RouterContext = createContext<Router>(null);

/**
 * Get the esp Router from the RouterContext
 *
 * To use this, please ensure your V-DOM has the EspRouterContext at a higher node:
 *
 * <EspRouterContext router={router}>
 *     <YourComponents />
 * </EspRouterContext>
 */
export const useRouter = () => {
    const context: Router = useContext(RouterContext);
    if (context === undefined) {
        throw new Error('useRouter must be used within a RouterContext.Provider');
    }
    return context;
};

export type PublishEventDelegate = (modelIdOrModelAddress: string | ModelAddress, eventType: string, event: any) => void;
export const PublishEventContext = createContext<PublishEventDelegate>(null);

/**
 * Returns a function which can be used to publish an event.
 *
 * To use this, please ensure your V-DOM has the EspRouterContext at a higher node:
 *
 * <EspRouterContext router={router}>
 *     <YourComponents />
 * </EspRouterContext>
 */
export const usePublishEvent = () => useContext(PublishEventContext);

export type EspRouterContextProps = PropsWithChildren<{ router: Router; }>;

/**
 * Used to set the router on the RouterContext making it available to components down the tree via the useRouter() hook.
 *
 * Also sets up the usePublishEvent() hook so nested components can publish to the router.
 */
export const EspRouterContext = ({children, router}: EspRouterContextProps) => {
    const publishEvent: PublishEventDelegate = useCallback((modelIdOrModelAddress: string, eventType: string, event: any) => {
        router.publishEvent(modelIdOrModelAddress, eventType, event);
    }, [router]);
    return (
        <RouterContext.Provider value={router}>
            <PublishEventContext.Provider value={publishEvent}>
                {children}
            </PublishEventContext.Provider>
        </RouterContext.Provider>
    );
};

/**
 * Used to set the router on the RouterContext making it available to components down the tree (via useRouter()).
 *
 * @deprecated use EspRouterContext
 */
export const RouterProvider = EspRouterContext;

/**
 * Props for RouterProvider
 *
 * @deprecated use EspRouterContextProps
 */
export type RouterProviderProps = EspRouterContextProps;