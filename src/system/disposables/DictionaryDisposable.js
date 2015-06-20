import DisposableWrapper from './DisposableWrapper';

export default class DictionaryDisposable {
    constructor() {
        this._isDisposed = false;
    }
    add(key, disposable) {
        if(this.hasOwnProperty(key)) {
            throw new Error("Key " + key + " already found");
        }
        var disposableWrapper = new DisposableWrapper(disposable);
        if(this._isDisposed) {
            disposableWrapper.dispose();
            return;
        }
        this[key] = disposableWrapper;
    }
    remove(key) {
        if(this.hasOwnProperty(key)) {
            delete this[key];
        }
    }
    dispose() {
       // if(!this._isDisposed) {
            this._isDisposed = true;
            for (var p in this) {
                if (this.hasOwnProperty(p)) {
                    var disposable = this[p];
                    if (disposable.dispose) {
                        disposable.dispose();
                    }
                }
            }
       // }
    }
}