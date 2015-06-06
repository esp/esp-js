import Guard from '../../Guard';

export default class DisposableWrapper {
    constructor(disposable) {
        Guard.isDefined(disposable, "disposable must be defined");
        var innerDisposable;
        if(typeof disposable === 'function') {
            innerDisposable = { dispose: function() { disposable(); } };
        } else if(disposable.dispose && typeof disposable.dispose === 'function') {
            innerDisposable = {
                dispose: () => {
                    // at this point if something has deleted the dispose or it's not a function we just ignore it.
                    if (disposable.dispose && typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                }
            };
        } else {
            throw new Error('Item to dispose was neither a function nor had a dispose method.');
        }
        this._isDisposed = false;
        this._disposable = innerDisposable;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        if(!this._isDisposed && this._disposable) {
            this._isDisposed = true;
            this._disposable.dispose();
        }
    }
}