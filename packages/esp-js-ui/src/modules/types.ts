// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import type React from 'react';
import type { Container } from 'esp-js-di';
import {App} from '../app';

export interface ModuleViewBinding {
    /** The EventBus storeId (modelId) this view is connected to */
    readonly storeId: string;
    /** The React component to render for this view */
    readonly viewComponent: React.ComponentType<any>;
    /** A string token identifying the shell region this view belongs to (metadata only) */
    readonly region: string;
}

export interface Module {
    readonly moduleId: string;
    readonly viewBindings: ReadonlyArray<ModuleViewBinding>;
    configureContainer(container: Container): void;
    initialise(app: App): Promise<void>;
    start(app: App): Promise<void>;
    dispose(): void;
}

export interface ModuleLoadResult {
    readonly moduleId: string;
    readonly status: 'success' | 'error';
    readonly error?: Error;
}

export type ModuleFactory = () => Promise<Module>;
export type ModuleOrFactory = Module | ModuleFactory;
