/*
 * Copyright 2015 Keith Woods
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