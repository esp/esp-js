// notice_start
/*
 * Copyright 2015 Dev Shop Limited
 *
 * Licensed under the Apache License, Version 2.0 (the 'License');
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// notice_end

import {DisposableWrapper} from './disposableWrapper';
import {Disposable, DisposableItem} from './disposable';

export class DictionaryDisposable implements Disposable {
    private _disposables: { [key:string]:Disposable; } = {};
    private _isDisposed: boolean;

    public constructor() {
        this._isDisposed = false;
    }

    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    public add(key: string, disposable: DisposableItem) {
        if (this._disposables.hasOwnProperty(key)) {
            throw new Error('Key ' + key + ' already found');
        }
        let disposableWrapper = new DisposableWrapper(disposable);
        if (this._isDisposed) {
            disposableWrapper.dispose();
            return;
        }
        this._disposables[key] = disposableWrapper;
    }

    public remove(key): boolean {
        if (this._disposables.hasOwnProperty(key)) {
            delete this._disposables[key];
            return true;
        }
        return false;
    }

    public containsKey(key): boolean {
        return this._disposables.hasOwnProperty(key);
    }

    public dispose(): void {
        this._isDisposed = true;
        for (let p in this._disposables) {
            if (this._disposables.hasOwnProperty(p)) {
                let disposable = this._disposables[p];
                if (disposable.dispose) {
                    disposable.dispose();
                }
            }
        }
    }
}