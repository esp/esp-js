"use strict";

import system from '../../../src/system';

describe('DictionaryDisposable', () => {
    var disposables;

    class Disposable {
        constructor() {
            this._isDisposed = false;
            this._disposeCount = 0;
        }
        get isDisposed() { return this._isDisposed; }
        get disposeCount() { return this._disposeCount; }
        dispose() {
            this._isDisposed = true;
            this._disposeCount++;
        }
    }

    beforeEach(() => {
        disposables = new system.disposables.DictionaryDisposable();
    });

    it('should dispose all disposables when dispose() called', () => {
        var disposable1 = new Disposable();
        var disposable2 = new Disposable();
        disposables.add("foo", disposable1);
        disposables.add("bar", disposable2);
        disposables.dispose();
        expect(disposable1.isDisposed).toEqual(true);
        expect(disposable2.isDisposed).toEqual(true);
    });

    it('should dispose an added disposed if already disposed', () => {
        disposables.dispose();
        var disposable = new Disposable();
        disposables.add("foo", disposable);
        expect(disposable.isDisposed).toEqual(true);
    });

    it('should not dispose a removed disposable', () => {
        var disposable1 = new Disposable();
        var disposable2 = new Disposable();
        disposables.add("foo", disposable1);
        disposables.add("bar", disposable2);
        disposables.remove("bar");
        disposables.dispose();
        expect(disposable1.isDisposed).toEqual(true);
        expect(disposable2.isDisposed).toEqual(false);
    });
});