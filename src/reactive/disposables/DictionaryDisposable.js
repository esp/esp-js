import DisposableWrapper from './DisposableWrapper';

export default class DictionaryDisposable {
    add(key, disposable) {
        if(this.hasOwnProperty(key)) {
            throw new Error("Key " + key + " already found");
        }
        var disposableWrapper = new DisposableWrapper(disposable);
        this[key] = disposableWrapper;
    }
    remove(key) {
        if(this.hasOwnProperty(key)) {
            delete this[key];
        }
    }
    dispose() {
        for(var p in this) {
            if(this.hasOwnProperty(p)) {
                var disposable = this[p];
                if(disposable.dispose) {
                    disposable.dispose();
                }
            }
        }
    }
}