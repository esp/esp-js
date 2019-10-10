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

import {RouterObservable} from '../routerObservable';
import {Guard} from '../../system';
import {Subscribe} from '../subscribeDelegate';

/**
 *
 * @param modelId - the modelId who's dispatch loop the changes will be invoked on
 * @returns {Observable}
 */
RouterObservable.prototype.streamFor = function<T>(modelId) {
    Guard.isString(modelId, 'modelId must be a string');
    Guard.isTruthy(modelId !== '', 'modelId must not be empty');
    let source = this;
    let hasCompleted = false;
    let subscribe: Subscribe<T>  = observer => {
        return source.subscribe(
            (item: T) => {
                if (hasCompleted) {
                    return;
                }
                source._router.runAction(modelId, () => {
                    observer.onNext(item);
                });
            },
            () => {
                hasCompleted = true;
                source._router.runAction(modelId, () => {
                    observer.onCompleted();
                });
            }
        );
    };
    return new RouterObservable<T>(source._router, subscribe);
};