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
import * as PropTypes from 'prop-types';
import { Router } from 'esp-js';
import {useContext} from 'react';

export interface RouterProviderProps {
    router: Router;
    // React 18 Fix:
    // The current codebase is React 16, it will work with React 18, but there were changes to the types in React 18.
    // The `children` prop was removed from some React types that cause the RouterProvider to fail, this fixes that.
    children: any;
}

export const RouterContext = React.createContext<Router>(null);
export const useRouter = () => useContext(RouterContext);

export class RouterProvider extends React.Component<RouterProviderProps, any> {
    static childContextTypes = {
        router: PropTypes.instanceOf(Router).isRequired
    };
    getChildContext() {
        return {
            router: this.props.router
        };
    }
    render() {
        return (<RouterContext.Provider value={this.props.router}>{this.props.children}</RouterContext.Provider>);
    }
}