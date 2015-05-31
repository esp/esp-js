class DisposableBase {
    constructor() {
        this._disposables = [];
        this._isDisposed = false;
    }
    addDisposable (disposable) {
        var d1;
        if(typeof disposable === 'function') {
            d1 = { dispose: function() { disposable(); } };
        } else if(disposable.dispose) {
            d1 = disposable;
        } else {
            throw new Error('Item to dispose was neither a function nor had a dispose method.');
        }
        if(this._isDisposed) {
            d1.dispose();
            return;
        }
        this._disposables.push(d1);
    }
    dispose () {
        if(!this._isDisposed) {
            this._isDisposed = true;
            for (var i = 0; i < this._disposables.length; i++) {
                var disposable = this._disposables[i];
                disposable.dispose();
            }
        }
    }
}
export default DisposableBase;