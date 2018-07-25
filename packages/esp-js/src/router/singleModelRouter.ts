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

import {Router}  from './router';
import {Guard} from '../system';
import {Observable, RouterObservable} from '../reactive';
import {ObservationStage} from './observationStage';
import {EventEnvelope} from './envelopes';
import {OnObserve} from '../reactive/observable';

export class SingleModelRouter<TModel> {
    private _underlying: Router;
    private _targetModelId: string;

    public constructor() {
    }

    public static create<TModel>() {
        let router = new SingleModelRouter<TModel>();
        router._underlying = new Router();
        router._targetModelId = 'modelId';
        return router;
    }

    public static createWithModel<TModel>(model: TModel) {
        Guard.isDefined(model, 'Model passed to to createWithModel must not be undefined.');
        let router = new SingleModelRouter<TModel>();
        router._underlying = new Router();
        router._targetModelId = 'modelId';
        router.setModel(model);
        return router;
    }

    public static createWithRouter<TModel>(underlyingRouter: Router, modelId: string) {
        Guard.isString(modelId, 'The modelId should be a string.');
        if (!(underlyingRouter instanceof Router)) {
            throw new Error('underlyingRouter must be of type Router.');
        }

        let router = new SingleModelRouter<TModel>();
        router._underlying = underlyingRouter;
        router._targetModelId = modelId;
        return router;
    }

    setModel(model: TModel) {
        Guard.isDefined(model, 'Model passed to setModel() must not be undefined.');
        this._underlying.addModel(this._targetModelId, model);
    }

    publishEvent(eventType: string, event: any) {
        this._ensureModelIsSet();
        this._underlying.publishEvent(this._targetModelId, eventType, event);
    }

    executeEvent(eventType: string, event: any) {
        this._ensureModelIsSet();
        this._underlying.executeEvent(eventType, event);
    }

    runAction(action: () => void) {
        this._ensureModelIsSet();
        this._underlying.runAction(this._targetModelId, action);
    }

    getEventObservable<TEvent>(eventType: string, stage?: ObservationStage): Observable<EventEnvelope<TEvent, TModel>> {
        this._ensureModelIsSet();
        return this._underlying.getEventObservable<TEvent, TModel>(this._targetModelId, eventType, stage);
    }

    getModelObservable(): Observable<TModel> {
        this._ensureModelIsSet();
        return this._underlying.getModelObservable<TModel>(this._targetModelId);
    }

    createObservable(observer: OnObserve<TModel>): RouterObservable<TModel> {
        return Observable
            .create(observer)
            .asRouterObservable(this._underlying)
            .subscribeOn(this._targetModelId);
    }

    createSubject<T>() {
        return this._underlying.createSubject<T>();
    }

    observeEventsOn(object: any, methodPrefix = '_observe_') {
        this._ensureModelIsSet();
        return this._underlying.observeEventsOn(this._targetModelId, object, methodPrefix);
    }

    isOnDispatchLoop(): boolean {
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
