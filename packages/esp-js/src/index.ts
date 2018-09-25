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
// import * as esp from 'esp-js';
// let eventContext = new esp.EventContext();
//
// 1) import single items
// import { Router } from 'esp-js';
// let router = new Router()

export { ObservationStage, Router, SingleModelRouter, EventContext, DefaultEventContext, ModelChangedEvent, DispatchType, EventEnvelope, ModelEnvelope, ModelOptions } from './router';
export { CompositeDisposable, DictionaryDisposable, DisposableBase, DisposableWrapper, Disposable } from './system/disposables';
export { observeEvent, observeModelChangedEvent, observeEventEnvelope } from './decorators/observeEvent';
export { EspDecoratorUtil, DecoratorTypes, EspMetadata, EspDecoratedObject, EventObservationMetadata, isEspDecoratedObject} from './decorators/espDecoratorMetadata';
export { logging, Guard, utils } from './system';
export { Observable } from './reactive/observable';
export { RouterObservable, Subject, RouterSubject } from './reactive';