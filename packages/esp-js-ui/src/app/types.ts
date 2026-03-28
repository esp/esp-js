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

import {Container} from 'esp-js-di';
import {EventBus} from 'esp-js';
import {Module} from '../modules/types';

export interface App {
    readonly appName: string;
    /**
     * The root IoC container. Available after start() resolves.
     * The EventBus is pre-registered as 'bus'. App-wide services registered
     * via withContainerConfiguration are also available here.
     */
    readonly container: Container;
    /**
     * The application EventBus. Pre-registered in the container as 'bus'.
     * Available after start() resolves.
     */
    readonly eventBus: EventBus;
    /**
     * All loaded modules. Available after start() resolves.
     */
    readonly modules: ReadonlyArray<Module>;
    /**
     * Runs the full application lifecycle:
     * 1. Configures the root container (withContainerConfiguration hooks)
     * 2. Loads all modules (resolves lazy factories in parallel)
     * 3. Configures each module's child container
     * 4. Runs app-level withInitialisation hooks (sequential, fatal)
     * 5. Runs module.initialise() on all modules (parallel, failures isolated)
     * 6. Runs module.start() on all modules (parallel, failures isolated)
     * 7. Runs app-level withStart hooks (sequential, fatal)
     *
     * Idempotent — subsequent calls are no-ops.
     */
    start(): Promise<void>;
    /**
     * Disposes all loaded modules in reverse load order.
     * Safe to call before start() (no-op). Errors per module are caught and logged.
     */
    dispose(): void;
}
