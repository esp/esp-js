class CompositeDisposable {
    constructor() {
        this._disposables = [];
        this._isDisposed = false;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    add(disposable) {
        if(disposable) {
            if (this._isDisposed) {
                this._disposeItem(disposable);
            } else {
                this._disposables.push(disposable);
            }
        }
    }
    dispose() {
        if(!this._isDisposed) {
            this._isDisposed = true;
            for (var d in this._disposables) {
                this._disposeItem(d);
            }
            this._disposables.length = 0;
        }
    }
    _disposeItem(d) {
        if(d.dispose && typeof d.dispose === 'function') {
            d.dispose();
        }
    }
}

export default CompositeDisposable;