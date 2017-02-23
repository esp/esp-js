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

import RouterObservable from '../RouterObservable';
import { Guard } from '../../system';

/**
 *
 * @param modelId - the modelId who's dispatch loop the changes will be invoked on
 * @returns {Observable}
 */
RouterObservable.prototype.streamFor = function(modelId) {
    Guard.isString(modelId, 'modelId must be a string');
    Guard.isTrue(modelId != '', "modelId must not be empty");
    let source = this;
    let hasCompleted = false;
    let subscribe =  observer => {
        return source.subscribe(
            (arg1, arg2, arg3) => {
                if(hasCompleted ) {
                    return;
                }
                source._router.runAction(modelId, () => {
                    observer.onNext(arg1, arg2, arg3);
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
    return new RouterObservable(source._router, subscribe);
};