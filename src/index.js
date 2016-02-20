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

import * as model from './model';
import { ObservationStage, Router, SingleModelRouter, EventContext } from './router';

import { observeEvent, observeModelChangedEvent } from './decorators/observeEvent';
import { logging as logging } from './system';

import { CompositeDisposable, DictionaryDisposable } from './system/disposables';
import { Observable } from './reactive';

// we export both a default object and individual items, this allows for both the following cases:
// 1) import the entire namespace
// import esp from 'esp';
// let eventContext = new esp.EventContext();
//
// 1) import single items
// import { EventContext } from 'esp';
// let eventContext = new EventContext()

export { ObservationStage, Router, SingleModelRouter, EventContext } from './router';
export { model };
export { observeEvent, observeModelChangedEvent };
export { logging };
export { CompositeDisposable };
export { DictionaryDisposable };
export { Observable };

export default {
    ObservationStage,
    Router,
    SingleModelRouter,
    model,
    observeEvent,
    observeModelChangedEvent,
    logging,
    EventContext,
    CompositeDisposable,
    DictionaryDisposable,
    Observable
}