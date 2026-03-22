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
 * distributed under the License is distributed on an 'AS IS' BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
 // notice_end

import {Observable} from '../reactive';
import {DispatchType, EventEnvelope, ModelEnvelope} from './envelopes';
import {AutoConnectedObservable} from '../reactive/autoConnectedObservable';
import {ObservationStage} from './index';
import {
    ModelConfig,
    EventHandler,
    PreviewHandler,
    EffectHandler,
    PublishDelegate,
    PreEventProcessorFn,
    PostEventProcessorFn,
} from '../model/types';
import {CompositeDisposable} from '../system/disposables';

export interface EventStreamsRegistration {
    all: AutoConnectedObservable<EventEnvelope<any, any>>;
    preview: AutoConnectedObservable<EventEnvelope<any, any>>;
    normal: AutoConnectedObservable<EventEnvelope<any, any>>;
    committed: AutoConnectedObservable<EventEnvelope<any, any>>;
    final: AutoConnectedObservable<EventEnvelope<any, any>>;
}

export type EventRecord = {entityKey: string, eventType: string, event: any};

interface InternalEventStreamsRegistration {
    streams: EventStreamsRegistration;
}

export class ModelRecord<TModel = any> {
    private readonly _modelId: string;
    private readonly _modelObservationStream: AutoConnectedObservable<ModelEnvelope<any>>;
    private readonly _eventQueue: EventRecord[];
    private _currentModel: TModel;
    private _hasReceivedEvent: boolean;
    private _wasRemoved: boolean;
    private _eventStreams: Map<string, InternalEventStreamsRegistration>;
    private _eventQueueDirtyEpochMs: number;

    public eventHandlers: Map<string, EventHandler<TModel, any>[]>;
    public previewHandlers: Map<string, PreviewHandler<TModel, any>[]>;
    public effectHandlers: Map<string, EffectHandler<TModel, any>[]>;
    public readonly subscriptionDisposables: CompositeDisposable;
    public publishDelegate: PublishDelegate;
    public preEventProcessorFn: PreEventProcessorFn<TModel>;
    public postEventProcessorFn: PostEventProcessorFn<TModel>;

    constructor(
        modelId: string,
        initialModel: TModel,
        modelObservationStream: AutoConnectedObservable<ModelEnvelope<any>>,
        config: ModelConfig<TModel>,
        publishDelegate: PublishDelegate
    ) {
        this._modelId = modelId;
        this._eventQueue = [];
        this._hasReceivedEvent = false;
        this._wasRemoved = false;
        this._eventStreams = new Map();
        this._modelObservationStream = modelObservationStream;
        this._eventQueueDirtyEpochMs = null;
        this._currentModel = initialModel;

        this.eventHandlers = config.eventHandlers;
        this.previewHandlers = config.previewHandlers;
        this.effectHandlers = config.effectHandlers;
        this.subscriptionDisposables = new CompositeDisposable();
        this.publishDelegate = publishDelegate;
        this.preEventProcessorFn = config.preEventProcessor || null;
        this.postEventProcessorFn = config.postEventProcessor || null;
    }

    public get modelId() {
        return this._modelId;
    }

    public get hasModel() {
        return this._currentModel !== undefined && this._currentModel !== null;
    }

    public get model(): TModel {
        return this._currentModel;
    }

    public get currentModel(): TModel {
        return this._currentModel;
    }

    public set currentModel(value: TModel) {
        this._currentModel = value;
    }

    public get eventQueue() {
        return this._eventQueue;
    }

    public get eventQueueDirtyEpochMs() {
        return this._eventQueueDirtyEpochMs;
    }

    public get hasReceivedEvent() {
        return this._hasReceivedEvent;
    }

    public set hasReceivedEvent(value) {
        this._hasReceivedEvent = value;
    }

    public get wasRemoved() {
        return this._wasRemoved;
    }

    public set wasRemoved(value) {
        this._wasRemoved = value;
    }

    public preEventProcessor(model: TModel): void {
        if (this.preEventProcessorFn) {
            this.preEventProcessorFn(model);
        }
    }

    public postEventProcessor(model: TModel, eventsProcessed: string[]): void {
        if (this.postEventProcessorFn) {
            this.postEventProcessorFn(model, eventsProcessed);
        }
    }

    // no-op stubs kept for router compatibility
    public eventDispatchProcessor(_model: TModel, _eventType: string, _event: any, _stage?: ObservationStage): void {
        // noop — no dispatch processor in functional model
    }

    public eventDispatchedProcessor(_model: TModel, _eventType: string, _event: any, _stage?: ObservationStage): void {
        // noop — no dispatch processor in functional model
    }

    public getOrCreateEventStreamsRegistration(eventType: string, dispatchObservable: Observable<EventEnvelope<any, any>>): EventStreamsRegistration {
        let eventStreamsRegistration = this._eventStreams.get(eventType);
        if (!eventStreamsRegistration) {
            const modelStream = dispatchObservable.filter(
                envelope => envelope.modelId === this.modelId
            ).share(false);
            const eventStream = modelStream.filter(
                envelope =>
                    envelope.dispatchType === DispatchType.Event &&
                    envelope.eventType === eventType
            ).share(false);
            eventStreamsRegistration = {
                streams: {
                    preview: eventStream
                        .filter(envelope => ObservationStage.isPreview(envelope.observationStage))
                        .share(false),
                    normal: eventStream
                        .filter(envelope => ObservationStage.isNormal(envelope.observationStage))
                        .share(false),
                    committed: eventStream
                        .filter(envelope => ObservationStage.isCommitted(envelope.observationStage))
                        .share(false),
                    final: eventStream
                        .filter(envelope => ObservationStage.isFinal(envelope.observationStage))
                        .share(false),
                    all: eventStream
                        .share(false)
                }
            };
            this._eventStreams.set(eventType, eventStreamsRegistration);
        }
        return eventStreamsRegistration.streams;
    }

    public tryEnqueueEvent(entityKey: string, eventType: string, event: any): boolean {
        if (!this._eventStreams.has(eventType)) {
            return false;
        }
        if (!this._eventQueueDirtyEpochMs) {
            this._eventQueueDirtyEpochMs = Date.now();
        }
        this.eventQueue.push({entityKey, eventType: eventType, event: event});
        return true;
    }

    public eventQueuePurged() {
        this._eventQueueDirtyEpochMs = null;
    }

    public get modelObservationStream(): Observable<any> {
        return this._modelObservationStream;
    }

    /**
     * Upgrades a placeholder (lazy) ModelRecord to a full model record with actual config.
     * Called when addModel() is called after getEventObservable() was called first.
     */
    public upgradeToFullModel(initialModel: TModel, config: ModelConfig<TModel>, publishDelegateArg: PublishDelegate) {
        this._currentModel = initialModel;
        this.eventHandlers = config.eventHandlers;
        this.previewHandlers = config.previewHandlers;
        this.effectHandlers = config.effectHandlers;
        this.publishDelegate = publishDelegateArg;
        this.preEventProcessorFn = config.preEventProcessor || null;
        this.postEventProcessorFn = config.postEventProcessor || null;
    }

    public dispose() {
        this._eventQueue.length = 0;
        this._modelObservationStream.disconnect();
        this._eventStreams.forEach(streamsRegistration => {
            streamsRegistration.streams.preview.disconnect();
            streamsRegistration.streams.normal.disconnect();
            streamsRegistration.streams.committed.disconnect();
            streamsRegistration.streams.all.disconnect();
        });
        this.subscriptionDisposables.dispose();
    }
}
