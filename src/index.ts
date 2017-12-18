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
//
export { RouterProvider } from './routerProvider';
export { SmartComponent } from './smartComponent';
export { ViewBinder } from './viewBinder';
export { viewBinding } from './viewBindingDecorator';
export { ModelSelector } from './modelSelector';
export { shouldUpdateMixin } from './shouldUpdateMixin';

import { RouterProvider } from './routerProvider';
import { SmartComponent } from './smartComponent';
import { ViewBinder } from './viewBinder';
import { viewBinding } from './viewBindingDecorator';
import { ModelSelector } from './modelSelector';
import { shouldUpdateMixin } from './shouldUpdateMixin';

export default {
    RouterProvider,
    SmartComponent,
    ViewBinder,
    viewBinding,
    ModelSelector,
    shouldUpdateMixin
};