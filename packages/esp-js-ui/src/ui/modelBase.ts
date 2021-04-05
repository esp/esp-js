import {Router, DisposableBase, Guard, Logger } from 'esp-js';
import {ViewInstance} from './viewFactory/viewFactoryBase';

export abstract class ModelBase extends DisposableBase implements ViewInstance {
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