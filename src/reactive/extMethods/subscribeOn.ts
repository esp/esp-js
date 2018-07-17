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

import {RouterObservable} from '../RouterObservable';
import {Guard} from '../../system';
import {Subscribe} from '../subscribeDelegate';

RouterObservable.prototype.subscribeOn = function<T>(modelId) {
    Guard.isString(modelId, 'modelId must be a string');
    Guard.isTrue(modelId !== '', 'modelId must not be empty');
    let source = this;
    let subscribe: Subscribe<T>  = observer => {
        let disposable = {
            subscription: null,
            isDisposed: false,
            dispose() {
                this.isDisposed = true;
                let _subscription = this.subscription;
                if (_subscription) {
                    source._router.runAction(modelId, () => {
                        _subscription.dispose();
                    });
                }
            }
        };
        source._router.runAction(modelId, () => {
            if (!disposable.isDisposed) {
                disposable.subscription = source.subscribe(observer);
            }
        });
        return disposable;
    };
    return new RouterObservable<T>(this._router, subscribe);
};
