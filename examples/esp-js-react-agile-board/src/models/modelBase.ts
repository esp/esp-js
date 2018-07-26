import { Disposable, Router } from 'esp-js';
import { List } from 'immutable';

export class ModelBase {
    private _modelId: string;
    private _router: Router;
    private _disposables = List<Disposable>();

    constructor(modelId: string, router: Router) {
        this._modelId = modelId;
        this._router = router;
        this._disposables = List<Disposable>();
    }

    public get modelId() {
        return this._modelId;
    }

    public get router() {
        return this._router;
    }

    public observeEvents() {
        this.router.observeEventsOn(this.modelId, this);
    }

    public addDisposable(disposable: Disposable) {
        this._disposables = this._disposables.push(disposable);
    }

    public dispose() {
        this._disposables.forEach(d => d.dispose());
    }

    // when models are interacting with other models the target model
    // needs to be on it's dispatch loop if it's going to make state changes,
    // otherwise the router has no way to know it's been modified thus observers need to be notified.
    // This function ensures the provided action is run on the correct dispatch loop.
    // See https://keithwoods.gitbooks.io/esp-js/content/advanced-concepts/model-to-model-communications.html
    public ensureOnDispatchLoop(action) {
        if (this.router.isOnDispatchLoopFor(this.modelId)) {
            action();
        } else {
            this.router.runAction(this.modelId, action);
        }
    }
}