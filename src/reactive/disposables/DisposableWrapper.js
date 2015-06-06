import Guard from '../../Guard';

export default class DisposableWrapper {
    constructor(disposable) {
        Guard.isDefined(disposable, "disposable must be defined");
        var d1;
        if(typeof disposable === 'function') {
            d1 = { dispose: function() { disposable(); } };
        } else if(disposable.dispose) {
            d1 = disposable;
        } else {
            throw new Error('Item to dispose was neither a function nor had a dispose method.');
        }
        this._isDisposed = false;
        this._disposable = d1;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        if(!this._isDisposed) {
            this._isDisposed = true;
            if(this._disposable) {
                this._disposable.dispose();
            }
        }
    }
}