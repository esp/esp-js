// notice_start
/*
 * Copyright 2015 Keith Woods
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

import Router from './Router';
import { Guard } from '../system';

export default class SingleModelRouter {
    constructor() {
        if(arguments.length === 0) {
            this._underlying = new Router();
            this._targetModelId = "modelId";
        } else if(arguments.length === 2 && (arguments[0] instanceof Router)) {
            this._modelSet = true;
            this._underlying = arguments[0];
            this._targetModelId = arguments[1];
        } else {
            throw new Error("Incorrect usage. SingleModelRouter can take either: no params (in which case you need to call .setModel()), or an existing router and existing modelid.");
        }
    }
    setModel(model) {
        Guard.isDefined(model, 'Model passed to setModel() must not be undefined.');
        Guard.isFalsey(this._modelSet, 'Model is already set.');
        this._underlying.registerModel(this._targetModelId, model);
        this._modelSet = true;
    }
    publishEvent(eventType, event) {
        this._ensureModelIsSet();
        this._underlying.publishEvent(this._targetModelId, eventType, event);
    }
    executeEvent(eventType, event) {
        this._ensureModelIsSet();
        this._underlying.executeEvent(eventType, event);
    }
    runAction(action) {
        this._ensureModelIsSet();
        this._underlying.runAction(this._targetModelId, action);
    }
    getEventObservable(eventType, stage) {
        this._ensureModelIsSet();
        return this._underlying.getEventObservable(this._targetModelId, eventType, stage);
    }
    getModelObservable() {
        this._ensureModelIsSet();
        return this._underlying.getModelObservable(this._targetModelId);
    }
    observeEventsOn(object, methodPrefix='_observe_') {
        this._ensureModelIsSet();
        return this._underlying.observeEventsOn(this._targetModelId, object, methodPrefix);
    }
    _ensureModelIsSet() {
        Guard.isTrue(this._modelSet, 'You must call \'singleModelRouterInstance.setModel(model)\' before interacting with the router');
    }
}