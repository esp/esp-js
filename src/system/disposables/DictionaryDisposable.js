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

import DisposableWrapper from './DisposableWrapper';

export default class DictionaryDisposable {
    constructor() {
        this._isDisposed = false;
    }
    add(key, disposable) {
        if(this.hasOwnProperty(key)) {
            throw new Error("Key " + key + " already found");
        }
        let disposableWrapper = new DisposableWrapper(disposable);
        if(this._isDisposed) {
            disposableWrapper.dispose();
            return;
        }
        this[key] = disposableWrapper;
    }
    remove(key) {
        if(this.hasOwnProperty(key)) {
            delete this[key];
        }
    }
    containsKey(key) {
        return this.hasOwnProperty(key);
    }
    dispose() {
       // if(!this._isDisposed) {
            this._isDisposed = true;
            for (let p in this) {
                if (this.hasOwnProperty(p)) {
                    let disposable = this[p];
                    if (disposable.dispose) {
                        disposable.dispose();
                    }
                }
            }
       // }
    }
}