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

import {Router} from './router';
import {Guard} from '../system';
import {Observable, RouterObservable, RouterSubject} from '../reactive';
import {ObservationStage} from './observationStage';
import {EventEnvelope} from './envelopes';
import {OnObserve} from '../reactive/observable';
import {ModelBuilder} from '../model/modelBuilder';

/**
 * @deprecated
 */
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

    /**
     * Creates a SingleModelRouter with a pre-registered model using a ModelBuilder.
     * The model is registered immediately via the builder.
     */
    public static createWithModel<TModel>(model: TModel): SingleModelRouter<TModel> {
        Guard.isDefined(model, 'Model passed to to createWithModel must not be undefined.');
        let router = new SingleModelRouter<TModel>();
        router._underlying = new Router();
        router._targetModelId = 'modelId';
        new ModelBuilder<TModel>(router._underlying, router._targetModelId, model).registerWithRouter();
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

    get underlying(): Router {
        return this._underlying;
    }

    get targetModelId(): string {
        Guard.stringIsNotEmpty(this._targetModelId, 'Model not yet set.');
        return this._targetModelId;
    }

    /**
     * Registers a model with the router using a ModelBuilder with no handlers.
     * For more complex registration, use ModelBuilder directly.
     */
    setModel(model: TModel): void {
        Guard.isDefined(model, 'Model passed to setModel() must not be undefined.');
        new ModelBuilder<TModel>(this._underlying, this._targetModelId, model).registerWithRouter();
    }

    publishEvent(eventType: string, event: any) {
        this._ensureModelIsSet();
        this._underlying.publishEvent(this._targetModelId, eventType, event);
    }

    executeEvent(eventType: string, event: any) {
        this._ensureModelIsSet();
        this._underlying.executeEvent(eventType, event);
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

    createSubject<T>(): RouterSubject<T> {
        return this._underlying.createSubject<T>();
    }

    isOnDispatchLoop(): boolean {
        this._ensureModelIsSet();
        return this._underlying.isOnDispatchLoopFor(this._targetModelId);
    }

    _ensureModelIsSet() {
        Guard.isTruthy(
            this._underlying.isModelRegistered(this._targetModelId),
            `Model with id ${this._targetModelId} not registered with the router`
        );
    }
}
