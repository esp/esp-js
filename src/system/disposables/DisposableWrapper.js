// notice_start
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
 // notice_end

import Guard from '../Guard';

export default class DisposableWrapper {
    constructor(disposable) {
        Guard.isDefined(disposable, "disposable must be defined");
        var innerDisposable;
        if(typeof disposable === 'function') {
            innerDisposable = { dispose: function() { disposable(); } };
        } else if(disposable.dispose && typeof disposable.dispose === 'function') {
            innerDisposable = {
                dispose: () => {
                    // at this point if something has deleted the dispose or it's not a function we just ignore it.
                    if (disposable.dispose && typeof disposable.dispose === 'function') {
                        disposable.dispose();
                    }
                }
            };
        } else {
            throw new Error('Item to dispose was neither a function nor had a dispose method.');
        }
        this._isDisposed = false;
        this._disposable = innerDisposable;
    }
    get isDisposed() {
        return this._isDisposed;
    }
    dispose() {
        if(!this._isDisposed && this._disposable) {
            this._isDisposed = true;
            this._disposable.dispose();
        }
    }
}