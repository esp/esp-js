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

import * as espReact from '../src/index';
import {
    RouterProvider,
    RouterContext,
    SmartComponent,
    ViewBinder,
    viewBinding,
    getEspReactRenderModel,
    GetEspReactRenderModelConsts,
    shouldUpdateMixin
} from '../src';

describe('index exports', () => {
    it('should export RouterProvider', () => {
        expect(espReact.RouterProvider).toBeDefined();
        expect(RouterProvider).toBeDefined();
    });

    it('should export RouterContext', () => {
        expect(espReact.RouterContext).toBeDefined();
        expect(RouterContext).toBeDefined();
    });

    it('should export SmartComponent', () => {
        expect(espReact.SmartComponent).toBeDefined();
        expect(SmartComponent).toBeDefined();
    });

    it('should export ViewBinder', () => {
        expect(espReact.ViewBinder).toBeDefined();
        expect(ViewBinder).toBeDefined();
    });

    it('should export viewBinding', () => {
        expect(espReact.viewBinding).toBeDefined();
        expect(viewBinding).toBeDefined();
    });

    it('should export getEspReactRenderModel decorator', () => {
        expect(espReact.getEspReactRenderModel).toBeDefined();
        expect(getEspReactRenderModel).toBeDefined();
    });

    it('should export GetEspReactRenderModelConsts', () => {
        expect(espReact.GetEspReactRenderModelConsts).toBeDefined();
        expect(GetEspReactRenderModelConsts).toBeDefined();
    });

    it('should export shouldUpdateMixin', () => {
        expect(espReact.shouldUpdateMixin).toBeDefined();
        expect(shouldUpdateMixin).toBeDefined();
    });
});