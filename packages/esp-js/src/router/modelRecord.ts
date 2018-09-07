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

import {PreEventProcessor, PostEventProcessor} from './eventProcessorDelegate';
import {ModelOptions} from './modelOptions';
import {Observable} from '../reactive';
import {DispatchType, EventEnvelope, ModelEnvelope} from './envelopes';
import {AutoConnectedObservable} from '../reactive/autoConnectedObservable';
import {Guard} from '../system';
import {ObservationStage} from './index';

export interface EventStreamsRegistration {
    all: AutoConnectedObservable<EventEnvelope<any, any>>;
    preview: AutoConnectedObservable<EventEnvelope<any, any>>;
    normal: AutoConnectedObservable<EventEnvelope<any, any>>;
    committed: AutoConnectedObservable<EventEnvelope<any, any>>;
}

interface InternalEventStreamsRegistration {
    streams: EventStreamsRegistration;
}

export class ModelRecord {
    private readonly _modelId: string;
    private readonly _modelObservationStream: AutoConnectedObservable<ModelEnvelope<any>>;
    private readonly _eventQueue: any[];
    private _model: any;
    private _hasChanges: boolean;
    private _wasRemoved: boolean;
    private _preEventProcessor: PreEventProcessor;
    private _postEventProcessor: PostEventProcessor;
    private _eventStreams: Map<string, InternalEventStreamsRegistration>;

    constructor(modelId: string, model: any, modelObservationStream: AutoConnectedObservable<ModelEnvelope<any>>, options?: ModelOptions) {
        this._modelId = modelId;
        this._eventQueue = [];
        this._hasChanges = false;
        this._wasRemoved = false;
        this._eventStreams = new Map();
        this._modelObservationStream = modelObservationStream;
        if (model) {
            this.setModel(model, options);
        }
    }
    public get modelId() {
        return this._modelId;
    }
    public get hasModel() {
        return !!this._model;
    }
    public get model() {
        return this._model;
    }
    public get eventQueue() {
        return this._eventQueue;
    }
    public get hasChanges() {
        return this._hasChanges;
    }
    public set hasChanges(value) {
        this._hasChanges = value;
    }
    public get wasRemoved() {
        return this._wasRemoved;
    }
    public set wasRemoved(value) {
        this._wasRemoved = value;
    }
    public get preEventProcessor(): PreEventProcessor {
        return this._preEventProcessor;
    }
    public get postEventProcessor(): PostEventProcessor {
        return this._postEventProcessor;
    }
    public getOrCreateEventStreamsRegistration(eventType: string, dispatchObservable: Observable<EventEnvelope<any, any>>): EventStreamsRegistration {
        let eventStreamsRegistration = this._eventStreams.get(eventType);
        if (!eventStreamsRegistration) {
            let eventStream =  dispatchObservable.filter(
                envelope =>
                    envelope.dispatchType === DispatchType.Event &&
                    envelope.modelId === this.modelId &&
                    envelope.eventType === eventType
            );
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
                    all: eventStream
                        .share(false)
                }
            };
            // there is no real reason to cache these stream filters other than less objects get created at runtime
            // that's a handy enough reason to aid in debugging and overall performance
            this._eventStreams.set(eventType, eventStreamsRegistration);
        }
        return eventStreamsRegistration.streams;
    }
    public enqueueEvent(eventType: string, event: any): void {
        this.eventQueue.push({eventType: eventType, event: event});
    }
    public get modelObservationStream(): Observable<any>  {
        return this._modelObservationStream;
    }
    public setModel(model: any, options?: ModelOptions) {
        Guard.isFalsey(this._model, 'Model already set');
        this._model = model;
        if (this._model) {
            this._preEventProcessor = this._createEventProcessor('preEventProcessor', 'preProcess', options ? options.preEventProcessor : undefined);
            this._postEventProcessor = this._createEventProcessor('postEventProcessor', 'postProcess', options ? options.postEventProcessor : undefined);
        }
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
    }
    _createEventProcessor(name, modelProcessMethod, externalProcessor):  (model: any, eventsProcessed?: string[]) => void {
        let externalProcessor1 = (model, eventsProcessed) => { /*noop */ };
        if(typeof externalProcessor !== 'undefined') {
            if(typeof externalProcessor === 'function') {
                externalProcessor1 = (model, eventsProcessed) => {
                    externalProcessor(model, eventsProcessed);
                };
            } else if (typeof externalProcessor.process === 'function') {
                externalProcessor1 = (model, eventsProcessed) => {
                    externalProcessor.process(model, eventsProcessed);
                };
            } else {
                throw new Error(name + ' on the options parameter is neither a function nor an object with a process() method');
            }
        }
        let modelProcessor = (model, eventsProcessed) => {
            if(model[modelProcessMethod] && (typeof model[modelProcessMethod] === 'function')) {
                model[modelProcessMethod](eventsProcessed);
            }
        };
        return (model, eventsProcessed) => {
            externalProcessor1(model, eventsProcessed);
            modelProcessor(model, eventsProcessed);
        };
    }
}