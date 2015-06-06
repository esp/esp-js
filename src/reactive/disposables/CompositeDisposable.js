import Guard from '../../Guard';
import DisposableWrapper from './DisposableWrapper';

export default class CompositeDisposable {
    constructor() {
        this._disposables = [];
        this._isDisposed = false;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    add(disposable) {
        var disposableWrapper = new DisposableWrapper(disposable);
        if(this._isDisposed) {
            disposableWrapper.dispose();
            return;
        }
        this._disposables.push(disposableWrapper);
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
        // at this point if something has deleted the dispose we just ignore it.
        // We've ensured it was there during the .add(), given this if it's gone now that must have been an explicit action.
        if(d.dispose) {
            d.dispose();
        }
    }
}