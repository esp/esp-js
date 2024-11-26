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
import { Router } from 'esp-js';
import {PropsWithChildren, createContext, useContext} from 'react';

export const RouterContext = createContext<Router>(null);

/**
 * Get the esp Router from the RouterContext
 *
 * To use this, please ensure your V-DOM sets the RouterContext at a higher node:
 *
 * <RouterContext.Provider value={router}>
 *     <YourComponents />
 * </RouterContext.Provider>
 */
export const useRouter = () => {
    const context: Router = useContext(RouterContext);
    if (context === undefined) {
        throw new Error('useRouter must be used within a RouterContext.Provider');
    }
    return context;
};

/**
 * Used to set the router on the RouterContext making it available to components down the tree (via useRouter()).
 *
 * @deprecated
 *
 * Legacy note: this is provided for backwards compatability.
 * Please use `<RouterContext.Provider router={theRouter}>{yourChildren}</RouterContext.Provider>` directly.
 */
export const RouterProvider = ({ router, children }: RouterProviderProps) => {
    return (<RouterContext.Provider value={router}>{children}</RouterContext.Provider>);
};

/**
 * Props for RouterProvider
 *
 * @deprecated
 *
 * Legacy note: this is provided for backwards compatability.
 * Please use `<RouterContext.Provider router={theRouter}>{yourChildren}</RouterContext.Provider>` directly.
 */
export type RouterProviderProps = PropsWithChildren<{ router: Router; }>;
