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

import {Guard, Logger} from 'esp-js';
import type React from 'react';
import type {Container} from 'esp-js-di';
import {Module, ModuleViewBinding} from './types';
import {DefaultModule} from './defaultModule';
import {App} from '../app';

const _log = Logger.create('ModuleBuilder');

export interface ModuleBuilderState {
    moduleId: string;
    viewBindings: ModuleViewBinding[];
    containerConfigurators: Array<(container: Container) => void>;
    initialiseFns: Array<(app: App) => Promise<void>>;
    startFns: Array<(app: App) => Promise<void>>;
}

export class ModuleBuilder {
    private _state: ModuleBuilderState;
    private _built: boolean = false;

    private constructor(moduleId: string) {
        this._state = {
            moduleId,
            viewBindings: [],
            containerConfigurators: [],
            initialiseFns: [],
            startFns: [],
        };
    }

    static create(moduleId: string): ModuleBuilder {
        Guard.stringIsNotEmpty(moduleId, 'moduleId must be a non-empty string');
        return new ModuleBuilder(moduleId);
    }

    private _guardNotBuilt(): void {
        if (this._built) {
            throw new Error('ModuleBuilder has already been built');
        }
    }

    withContainerConfiguration(fn: (container: Container) => void): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withContainerConfiguration fn must be defined');
        this._state.containerConfigurators.push(fn);
        return this;
    }

    withView(storeId: string, viewComponent: React.ComponentType<any>, region: string): this {
        this._guardNotBuilt();
        Guard.stringIsNotEmpty(storeId, 'storeId must be a non-empty string');
        Guard.isDefined(viewComponent, 'viewComponent must be defined');
        Guard.stringIsNotEmpty(region, 'region must be a non-empty string');
        this._state.viewBindings.push({ storeId, viewComponent, region });
        return this;
    }

    withInitialisation(fn: (app: App) => Promise<void>): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withInitialisation fn must be defined');
        this._state.initialiseFns.push(fn);
        return this;
    }

    withStart(fn: (app: App) => Promise<void>): this {
        this._guardNotBuilt();
        Guard.isDefined(fn, 'withStart fn must be defined');
        this._state.startFns.push(fn);
        return this;
    }

    build(): Module {
        this._guardNotBuilt();
        this._built = true;
        return new DefaultModule(this._state);
    }
}
