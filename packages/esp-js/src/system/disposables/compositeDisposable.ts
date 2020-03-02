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

import {DisposableWrapper}  from './disposableWrapper';
import {Disposable, DisposableItem} from './disposable';

export class CompositeDisposable implements Disposable {
    private readonly _disposables: Disposable[];
    private _isDisposed: boolean;

    public constructor(...disposables: Disposable[]) {
        this._disposables = [];
        this._isDisposed = false;
        for (let disposable of disposables) {
            this.add(disposable);
        }
    }

    public get isDisposed(): boolean {
        return this._isDisposed;
    }

    public add(disposable: () => void);
    public add(disposable: DisposableItem);
    public add(disposable: any) {
        let disposableWrapper = new DisposableWrapper(disposable);
        if (this._isDisposed) {
            disposableWrapper.dispose();
            return;
        }
        this._disposables.push(disposableWrapper);
    }

    public dispose(): void {
        if (!this._isDisposed) {
            this._isDisposed = true;
            for (let i = 0, len = this._disposables.length; i < len; i++) {
                let disposable = this._disposables[i];
                disposable.dispose();
            }
            this._disposables.length = 0;
        }
    }
}