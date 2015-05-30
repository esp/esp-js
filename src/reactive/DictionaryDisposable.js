class DictionaryDisposable {
    add(key, disposable) {
        if(this.hasOwnProperty(key)) {
            throw new Error("Key " + key + " already found");
        }
        this[key] = disposable;
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
                if(disposable && disposable.dispose && typeof disposable.dispose === 'function') {
                    disposable.dispose();
                }
            }
        }
    }
}
export default DictionaryDisposable;