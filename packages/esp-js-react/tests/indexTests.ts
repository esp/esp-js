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
    ViewBinder,
    viewBinding,
    getEspReactRenderModel,
    GetEspReactRenderModelConsts,

    useRouter,
    RouterContext,
    RouterProvider,

    useGetModelId,
    GetModelIdContext,

    PublishEventContext,
    usePublishEvent,

    PublishModelEventContext,
    usePublishModelEvent,

    PublishModelEventWithEntityKeyContext,
    usePublishModelEventWithEntityKey,
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

    describe('hooks', () => {

        it('should export useRouter and related', () => {
            expect(espReact.useRouter).toBeDefined();
            expect(useRouter).toBeDefined();

            expect(espReact.RouterContext).toBeDefined();
            expect(RouterContext).toBeDefined();
        });

        it('should export useGetModelId and related', () => {
            expect(espReact.useGetModelId).toBeDefined();
            expect(useGetModelId).toBeDefined();

            expect(espReact.GetModelIdContext).toBeDefined();
            expect(GetModelIdContext).toBeDefined();
        });

        it('should export usePublishEvent and related', () => {
            expect(espReact.usePublishEvent).toBeDefined();
            expect(usePublishEvent).toBeDefined();

            expect(espReact.PublishEventContext).toBeDefined();
            expect(PublishEventContext).toBeDefined();
        });

        it('should export usePublishModelEvent and related', () => {
            expect(espReact.usePublishModelEvent).toBeDefined();
            expect(usePublishModelEvent).toBeDefined();

            expect(espReact.PublishModelEventContext).toBeDefined();
            expect(PublishModelEventContext).toBeDefined();
        });

        it('should export usePublishModelEventWithEntityKey and related', () => {
            expect(espReact.usePublishModelEventWithEntityKey).toBeDefined();
            expect(usePublishModelEventWithEntityKey).toBeDefined();

            expect(espReact.PublishModelEventContext).toBeDefined();
            expect(PublishModelEventWithEntityKeyContext).toBeDefined();
        });
    });
});