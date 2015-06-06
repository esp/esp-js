import Guard from '../Guard';
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
            for (var i = 0, len = this._disposables.length; i < len; i++) {
                var disposable = this._disposables[i];
                disposable.dispose();
            }
            this._disposables.length = 0;
        }
    }
}