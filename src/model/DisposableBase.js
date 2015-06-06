import system from '../system';

class DisposableBase {
    constructor() {
        this._disposables = new system.disposables.CompositeDisposable();
    }
    get isDisposed() {
        return this._disposables.isDisposed;
    }
    addDisposable (disposable) {
        this._disposables.add(disposable);
    }
    dispose () {
        this._disposables.dispose();
    }
}
export default DisposableBase;