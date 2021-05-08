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

import {DisposableBase} from '../disposables';
import {Router} from '../../router';
import {Guard} from '../guard';
import { Logger } from '../logging/logger';

export abstract class ModelBase extends DisposableBase {
    protected _log: Logger;
    private  _observeEventsCalled = false;

    constructor(protected _modelId:string, protected _router:Router) {
        super();
        Guard.isString(_modelId, 'modelId required and must be a string');
        Guard.isDefined(_router, 'router required');

        this._log = Logger.create(`ModelBase-${_modelId}`);
    }

    public observeEvents() {
        if (this._observeEventsCalled) {
            throw new Error(`observeEvents already called for model with id ${this._modelId}`);
        }
        this._observeEventsCalled = true;
        this._log.debug(`Adding model with id ${this._modelId} to router`);
        this.router.addModel(this._modelId, this);
        this.addDisposable(() => {
            this._log.debug(`Removing model with id ${this._modelId} from router`);
            this.router.removeModel(this._modelId);
        });
        this.addDisposable(this.router.observeEventsOn(this._modelId, this));
    }

    /**
     * Runs the given action on the dispatch loop for this model, ensures that any model observer will be notified of the change
     * @param action
     */
    public ensureOnDispatchLoop(action:() => void) {
        if (this.router.isOnDispatchLoopFor(this.modelId)) {
            action();
        } else {
            this.router.runAction(this.modelId, () => {
                action();
            });
        }
    }

    public isOnDispatchLoop() {
        return this._router.isOnDispatchLoopFor(this.modelId);
    }

    public get modelId():string {
        return this._modelId;
    }

    public get router():Router {
        return this._router;
    }
}