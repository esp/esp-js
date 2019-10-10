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
 
import espDi from '../src/index';
import * as espDiStar from '../src/index';
import { Container, RegistrationModifier, ResolverContext, EspDiConsts  } from '../src/index';

describe('index exports', () =>  {

    it('Container exported on default export', () =>  {
        expect(espDi.Container).toBeDefined();
    });

    it('RegistrationModifier exported on default export', () =>  {
        expect(espDi.RegistrationModifier).toBeDefined();
    });

    it('ResolverContext exported on default export', () =>  {
        expect(espDi.ResolverContext).toBeDefined();
    });

    it('Container exported on it\'s own', () =>  {
        expect(espDiStar.Container).toBeDefined();
        expect(Container).toBeDefined();
    });

    it('RegistrationModifier exported on it\'s own', () =>  {
        expect(espDiStar.RegistrationModifier).toBeDefined();
        expect(RegistrationModifier).toBeDefined();
    });

    it('ResolverContext exported on it\'s own', () =>  {
        expect(espDiStar.ResolverContext).toBeDefined();
        expect(ResolverContext).toBeDefined();
    });

    it('EspDiConsts exported on it\'s own', () =>  {
        expect(espDiStar.EspDiConsts).toBeDefined();
        expect(EspDiConsts).toBeDefined();
    });
});