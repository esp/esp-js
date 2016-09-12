import esp from 'esp-js';
import _ from 'lodash';

@esp.dirtyTracking()
export default class ModelBase {
    constructor(modelId, router) {
        this.modelId = modelId;
        this.router = router;
        this._disposables = [];
        this._isDirty = false;
    }

    get isDirty() {
        return this._isDirty;
    }
    set isDirty(value) {
        this._isDirty = value;
    }

    observeEvents() {
        this.router.observeEventsOn(this.modelId, this);
    }

    addDisposable(disposable) {
        this._disposables.push(disposable);
    }

    dispose() {
        _.forEach(this._disposables, d => d.dispose());
    }

    // when models are interacting with other models the target model
    // needs to be on it's dispatch loop if it's going to make state changes,
    // otherwise the router has no way to know it's been modified thus observers need to be notified.
    // This function ensures the provided action is run on the correct dispatch loop.
    // See https://keithwoods.gitbooks.io/esp-js/content/advanced-concepts/model-to-model-communications.html
    ensureOnDispatchLoop(action) {
        if(this.router.isOnDispatchLoopFor(this.modelId)) {
            action();
        } else {
            this.router.runAction(this.modelId, action);
        }
    }
}