import {Router, DisposableBase, Guard } from 'esp-js';
import { Logger } from '../core';
import {ComponentInstance} from './components/componentFactoryBase';

export abstract class ModelBase extends DisposableBase implements ComponentInstance {
    protected _log: Logger;
    private  _observeEventsCalled = false;

    constructor(protected _modelId:string, protected _router:Router) {
        super();
        Guard.isString(_modelId, 'modelId required and must be a string');
        Guard.isDefined(_router, 'router required');

        this._log = Logger.create(`ModelBase-${_modelId}`);
    }

    public getTitle(): string { return ''; }

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

    // override if you're a component (i.e. created by a component factory)
    // and want to take part in saving and loading state.
    // It should be a normal object which will get stringified
    public getState(): any {
        return null;
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

    public get modelId():string {
        return this._modelId;
    }

    public get router():Router {
        return this._router;
    }
}