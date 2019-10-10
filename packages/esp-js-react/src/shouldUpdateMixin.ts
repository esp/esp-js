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
import {shallowEqual} from './shallowEqual';

// WORKS (compiles at least):
//
// export function shouldUpdateMixin<TProps, TState, TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TProps) => TPropBindings) {
//     return function <T extends {new(...args:any[]):{}}>(constructor:T) {
//         return class extends constructor {
//             _propBindings : {};
//             shouldComponentUpdate(nextProps, nextState) {
//                 let newBindings = itemsThatEffectUpdateSelector(nextProps);
//                 let bindingsAreEqual = shallowEqual(this._propBindings, newBindings);
//                 this._propBindings = newBindings;
//                 return !bindingsAreEqual;
//             }
//             render() {
//                 return React.createElement(<any>constructor, (<any>this).props);
//             }
//         };
//     };
// }

export function shouldUpdateMixin<TProps, TState, TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TProps) => TPropBindings) {
    return function <TConstructor extends { new(...args: any[]): {} }>(Constructor: TConstructor) {
        return class extends Constructor {
            _propBindings: {};
            shouldComponentUpdate(nextProps, nextState) {
                let newBindings = itemsThatEffectUpdateSelector(nextProps);
                let bindingsAreEqual = shallowEqual(this._propBindings, newBindings);
                this._propBindings = newBindings;
                return !bindingsAreEqual;
            }
            render() {
                return React.createElement(<any>Constructor, (<any>this).props);
            }
        };
    };
}

// export function shouldUpdateMixin<TProps, TState, TPropBindings>(itemsThatEffectUpdateSelector: (nextProps: TProps) => TPropBindings) {
//     return function(Comp: React.ComponentClass<TProps, TState>) {
//         return class extends React.Component<TProps, TState> {
//             _propBindings : {};
//             shouldComponentUpdate(nextProps, nextState) {
//                 let newBindings = itemsThatEffectUpdateSelector(nextProps);
//                 let bindingsAreEqual = shallowEqual(this._propBindings, newBindings);
//                 this._propBindings = newBindings;
//                 return !bindingsAreEqual;
//             }
//             render() {
//                 return React.createElement(Comp, this.props);
//             }
//         };
//     };
// }