/* notice_start
 * Copyright 2016 Dev Shop Limited
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
 notice_end */

// we export both a default object and individual items, this allows for differing import usages:
//
// 1) import the entire namespace
// import di from 'esp-js-di';
// let container = new di.Container();
//
// 2) import the entire namespace using *
// import * as di from from 'esp-js-di';
// let container = new di.Container()
//
// 2) import single items
// import { Container } from 'esp-js-di';
// let container = new Container()

import Container from './container';
import RegistrationModifier from './registrationModifier';
import ResolverContext from './resolverContext';
import EspDiConsts from './espDiConsts';

export { Container };
export { RegistrationModifier };
export { ResolverContext };
export { EspDiConsts };

export default {
    Container,
    RegistrationModifier,
    ResolverContext,
    EspDiConsts
};