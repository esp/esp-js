// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import * as system from '../../../src/system';
const CompositeDisposable =  system.disposables.CompositeDisposable;

describe('CompositeDisposable', () => {
    let disposables;

    class Disposable {
        private _isDisposed: boolean;
        constructor() {
            this._isDisposed = false;
        }
        get isDisposed() { return this._isDisposed; }
        dispose() { this._isDisposed = true; }
    }

    it('should dispose all disposables when dispose() called', () => {
        let d3Disposed = false;
        let d4Disposed = false;
        let d5Disposed = false;
        let disposable1 = new Disposable();
        let disposable2 = new Disposable();
        let disposable3 = () => { d3Disposed = true; };
        let disposable4 = () => { d4Disposed = true; };
        let disposable5 = () => { d5Disposed = true; };
        disposables = new CompositeDisposable(disposable3, disposable4);
        disposables.add(disposable1);
        disposables.add(disposable2);
        disposables.add(disposable5);
        disposables.dispose();
        expect(disposable1.isDisposed).toEqual(true);
        expect(disposable2.isDisposed).toEqual(true);
        expect(d3Disposed).toEqual(true);
        expect(d4Disposed).toEqual(true);
        expect(d5Disposed).toEqual(true);
    });

    it('should dispose an added disposed if already disposed', () => {
        disposables = new CompositeDisposable();
        disposables.dispose();
        let disposable = new Disposable();
        disposables.add(disposable);
        expect(disposable.isDisposed).toEqual(true);
    });

    it('should accept a set of disposables in the constructor',  () => {
        disposables = new CompositeDisposable();
        let disposable1 = new Disposable();
        let disposable2Disposed = false;
        let disposable2 = () => {
            disposable2Disposed = true;
        };
        disposables = new CompositeDisposable(disposable1, disposable2);
        disposables.dispose();
        expect(disposable1.isDisposed).toEqual(true);
        expect(disposable2Disposed).toEqual(true);
    });

    it('can remove a disposable function which was added via ctor',  () => {
        let d1Disposed = false;
        let d2Disposed = false;
        const d1 = () => { d1Disposed = true; };
        const d2 = () => { d2Disposed = true; };
        disposables = new CompositeDisposable(d1, d2);
        disposables.remove(d2);
        disposables.dispose();
        expect(d1Disposed).toEqual(true);
        expect(d2Disposed).toEqual(false);
    });

    it('can remove a disposable function which was added via .add',  () => {
        let d1Disposed = false;
        let d2Disposed = false;
        const d1 = () => { d1Disposed = true; };
        const d2 = () => { d2Disposed = true; };
        disposables = new CompositeDisposable();
        disposables.add(d1).add(d2);
        disposables.remove(d1);
        disposables.dispose();
        expect(d1Disposed).toEqual(false);
        expect(d2Disposed).toEqual(true);
    });
});