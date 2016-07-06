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

import Observable from '../Observable';
import { Guard } from '../../system';

Observable.prototype.observeOn = function(router, modelId) {
    Guard.isDefined(router, "router must be defined");
    Guard.isString(modelId, "modelId must be a string");
    var source = this;
    var hasCompleted = false;
    var observe =  observer => {
        return source.observe(
            (arg1, arg2, arg3) => {
                if(hasCompleted ) {
                    return;
                }
                router.runAction(modelId, () => {
                    observer.onNext(arg1, arg2, arg3);
                });
            },
            () => {
                hasCompleted = true;
                router.runAction(modelId, () => {
                    observer.onCompleted();
                });
            }
        );
    };
    return new Observable(observe);
};
