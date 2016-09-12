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

// we export both a default object and individual items, this allows for both the following cases:
// 1) import the entire namespace
// import esp from 'esp-js';
// let eventContext = new esp.EventContext();
//
// 1) import single items
// import { EventContext } from 'esp-js';
// let eventContext = new EventContext()

export { ObservationStage, Router, SingleModelRouter, EventContext, ModelChangedEvent } from './router';
export { CompositeDisposable, DictionaryDisposable, DisposableBase, DisposableWrapper } from './system/disposables';
export { observeEvent, observeModelChangedEvent } from './decorators/observeEvent';
export { default as dirtyTracking } from './decorators/dirtyTracking';
export { logging as logging } from './system';
export { Observable, RouterObservable, Subject, RouterSubject } from './reactive';

import { ObservationStage, Router, SingleModelRouter, EventContext, ModelChangedEvent } from './router';
import { CompositeDisposable, DictionaryDisposable, DisposableBase, DisposableWrapper } from './system/disposables';
import { observeEvent, observeModelChangedEvent } from './decorators/observeEvent';
import { default as dirtyTracking } from './decorators/dirtyTracking';
import { logging as logging } from './system';
import { Observable, RouterObservable, Subject, RouterSubject  } from './reactive';

export default {
    ObservationStage,
    Router,
    SingleModelRouter,
    DisposableBase,
    ModelChangedEvent,
    observeEvent,
    observeModelChangedEvent,
    dirtyTracking,
    logging,
    EventContext,
    CompositeDisposable,
    DictionaryDisposable,
    DisposableWrapper,
    Observable,
    Subject,
    RouterObservable,
    RouterSubject
}