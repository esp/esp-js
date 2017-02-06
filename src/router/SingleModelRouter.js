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

import Router from './Router';
import { Guard } from '../system';
import { Observable } from '../reactive';

export default class SingleModelRouter {
    constructor() {
    }
    static create() {
        let router = new SingleModelRouter();
        router._underlying = new Router();
        router._targetModelId = "modelId";
        return router;
    }
    static createWithModel(model) {
        Guard.isDefined(model, 'Model passed to to createWithModel must not be undefined.');
        let router = new SingleModelRouter();
        router._underlying = new Router();
        router._targetModelId = "modelId";
        router.setModel(model);
        return router;
    }
    static createWithRouter(underlyingRouter, modelId) {
        Guard.isString(modelId, 'The modelId should be a string.');
        if(!(underlyingRouter instanceof Router)) {
            throw new Error('underlyingRouter must be of type Router.');
        }

        let router = new SingleModelRouter();
        router._underlying = underlyingRouter;
        router._targetModelId = modelId;
        return router;
    }
    setModel(model) {
        Guard.isDefined(model, 'Model passed to setModel() must not be undefined.');
        this._underlying.addModel(this._targetModelId, model);
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
    createObservable(observer) {
        return Observable
            .create(observer)
            .asRouterObservable(this._underlying)
            .subscribeOn(this._targetModelId);
    }
    createSubject() {
        return this._underlying.createSubject();
    }
    observeEventsOn(object, methodPrefix='_observe_') {
        this._ensureModelIsSet();
        return this._underlying.observeEventsOn(this._targetModelId, object, methodPrefix);
    }
    isOnDispatchLoop() {
        this._ensureModelIsSet();
        return this._underlying.isOnDispatchLoopFor(this._targetModelId);
    }
    _ensureModelIsSet() {
        Guard.isTrue(
            this._underlying.isModelRegistered(this._targetModelId),
            `Model with id ${this._targetModelId} not registered with the router`
        );
    }
}
