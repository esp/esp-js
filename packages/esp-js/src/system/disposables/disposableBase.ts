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

import {CompositeDisposable} from './compositeDisposable';
import {Disposable, DisposableItem} from './disposable';

export class DisposableBase implements Disposable {
    private _disposables: CompositeDisposable;

    constructor() {
        this._disposables = new CompositeDisposable();
    }

    public get isDisposed(): boolean {
        return this._disposables.isDisposed;
    }

    public addDisposable(disposable: () => void);
    public addDisposable(disposable: DisposableItem);
    public addDisposable(disposable: any) {
        this._disposables.add(disposable);
    }

    public dispose(): void {
        this._disposables.dispose();
    }
}