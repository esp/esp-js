import _ from 'lodash';

export default class ModelBase {
    constructor(modelId, router) {
        this.modelId = modelId;
        this.router = router;
        this._disposables = [];
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
}