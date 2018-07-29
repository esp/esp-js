// notice_start
/*
 * Copyright 2018 Keith Woods
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
import { shallowEqual } from './shallowEqual';
//
// export function shouldUpdateMixin<S, P, T extends { new (... args:any[]): React.Component<S, P>  }, TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TPropBindings) => any) {
//     return (Component: any ) => {
//         return class extends React.Component<P, S> {
//             _propBindings: {};
//             shouldComponentUpdate(nextProps, nextState) {
//                 let newBindings = itemsThatEffectUpdateSelector(nextProps);
//                 let bindingsAreEqual = shallowEqual(this._propBindings, newBindings);
//                 this._propBindings = newBindings;
//                 return !bindingsAreEqual;
//             }
//
//             render() {
//                 return React.createElement(Component, this.props);
//             }
//         };
//     };
// }
export function shouldUpdateMixin<TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TPropBindings) => any) {
    return (Component:any ) => {
        return class extends React.Component<any, any> {
            _propBindings : {};
            shouldComponentUpdate(nextProps, nextState) {
                let newBindings = itemsThatEffectUpdateSelector(nextProps);
                let bindingsAreEqual = shallowEqual(this._propBindings, newBindings);
                this._propBindings = newBindings;
                return !bindingsAreEqual;
            }
            render() {
                return React.createElement(Component, this.props);
            }
        };
    };
}