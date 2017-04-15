// pulled from https://github.com/AdaptiveConsulting/ReactiveTraderCloud
// licence Apache 2

import {Router, DisposableBase } from 'esp-js';
import { Logger, Guard } from '../core';

abstract class ModelBase extends DisposableBase {
    private _log: Logger;

    constructor(protected _modelId:string, protected _router:Router) {
        super();
        Guard.isString(_modelId, 'modelId required and must be a string');
        Guard.isDefined(_router, 'router required');

        this._log = Logger.create(`ModelBase-${_modelId}`);
    }

    abstract getTitle(): string;

    observeEvents() {
        this._log.debug(`Adding model with id ${this._modelId} to router`);
        this.router.addModel(this._modelId, this);
        this.addDisposable(() => {
            this._log.debug(`Removing model with id ${this._modelId} from router`);
            this.router.removeModel(this._modelId);
        });
        this.addDisposable(this.router.observeEventsOn(this._modelId, this));
    }

    // override if you're a component (i.e. created by a component factory)
    // and want to take part in saving and loading state.
    // It should be a normal object which will get stringified
    getState(): any {
        return null;
    }

    /**
     * Runs the given action on the dispatch loop for this model, ensures that any model observer will be notified of the change
     * @param action
     */
    ensureOnDispatchLoop(action:() => void) {
        // TODO update when https://github.com/esp/esp-js/issues/86 is implemented
        this.router.runAction(this.modelId, ()=> {
            action();
        });
    }

    get modelId():string {
        return this._modelId;
    }

    get router():Router {
        return this._router;
    }
}

export default ModelBase;
