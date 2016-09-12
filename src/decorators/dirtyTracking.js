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

import { Guard, utils } from "../system";
import EspDecoratorMetadata from './espDecoratorMetadata';

export default function dirtyTracking(isDirtyPropName) {
    return function (target, name, descriptor) {
        // the dirtyTracking decorator is designed to go on a class, thus
        // 'target' will be the constructor function itself
        let metadata = EspDecoratorMetadata.getOrCreateOwnMetaData(target);
        metadata.addDirtyTracking(isDirtyPropName);
        return descriptor;
    };
}