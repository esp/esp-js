"use strict";

import system from '../../../src/system';

describe('CompositeDisposable', () => {
    var disposables;

    class Disposable {
        constructor() {
            this._isDisposed = false;
        }
        get isDisposed() { return this._isDisposed; }
        dispose() { this._isDisposed = true; }
    }

    beforeEach(() => {
        disposables = new system.disposables.CompositeDisposable();
    });

    it('should dispose all disposables when dispose() called', () => {
        var disposable1 = new Disposable();
        var disposable2 = new Disposable();
        disposables.add(disposable1);
        disposables.add(disposable2);
        disposables.dispose();
        expect(disposable1.isDisposed).toEqual(true);
        expect(disposable2.isDisposed).toEqual(true);
    });

    it('should dispose an added disposed if already disposed', () => {
        disposables.dispose();
        var disposable = new Disposable();
        disposables.add(disposable);
        expect(disposable.isDisposed).toEqual(true);
    });
});