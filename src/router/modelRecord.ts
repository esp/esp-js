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
import {EventType, isModelChangedEventType, isStringEventType, ModelChangedEventType} from './eventType';
import {Consts, ObservationStage} from './index';

export interface EventStreamsRegistration {
    preview: AutoConnectedObservable<EventEnvelope<any, any>>;
    normal: AutoConnectedObservable<EventEnvelope<any, any>>;
    committed: AutoConnectedObservable<EventEnvelope<any, any>>;
}

interface InternalEventStreamsRegistration {
    streams: EventStreamsRegistration;
    modelChangedEvent_observedModelId: string;
}

export class ModelRecord {
    private _modelId: string;
    private _model: any;
    private _eventQueue: any[];
    private _hasChanges: boolean;
    private _wasRemoved: boolean;
    private _preEventProcessor: PreEventProcessor;
    private _postEventProcessor: PostEventProcessor;
    private _eventStreams: Map<string, InternalEventStreamsRegistration>;
    private _modelObservationStream: AutoConnectedObservable<ModelEnvelope<any>>;

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
    public getOrCreateEventStreamsRegistration(eventType: EventType, dispatchObservable: Observable<EventEnvelope<any, any>>): EventStreamsRegistration {
        let destructedEventType = this._destructEventType(eventType);
        let eventStreamsRegistration = this._eventStreams.get(destructedEventType.eventType);
        if (!eventStreamsRegistration) {
            let eventStream =  dispatchObservable.where(
                envelope =>
                    envelope.dispatchType === DispatchType.Event &&
                    envelope.modelId === this.modelId &&
                    envelope.eventType === destructedEventType.eventType
            );
            eventStreamsRegistration = {
                streams: {
                    preview: eventStream
                        .where(envelope => envelope.observationStage === ObservationStage.preview)
                        .share(false),
                    normal: eventStream
                        .where(envelope => envelope.observationStage === ObservationStage.normal)
                        .share(false),
                    committed: eventStream
                        .where(envelope => envelope.observationStage === ObservationStage.committed)
                        .share(false)
                },
                // in the case it's the inbuilt model changed event we need to store some extra
                // details to ensure we only enqueue modelChangedEvents that are actually observed by this model,
                // else we'll end up in a tight loop as models continue to observe other models they aren't tracking
                modelChangedEvent_observedModelId: destructedEventType.modelChangedEvent_observedModelId
            };
            this._eventStreams.set(destructedEventType.eventType, eventStreamsRegistration);
        }
        return eventStreamsRegistration.streams;
    }
    public tryEnqueueEvent(eventType: string, event: any): boolean {
        if (this._eventStreams.has(eventType)) {
            let registration = this._eventStreams.get(eventType);
            let shouldEnqueue = eventType === Consts.modelChangedEvent
                ? (<ModelChangedEventType>event).modelId === registration.modelChangedEvent_observedModelId
                : true;
            if (shouldEnqueue) {
                this.eventQueue.push({eventType: eventType, event: event});
                return true;
            }
        }
        return false;
    }
    public hasObserversForEventType(eventType: string): boolean {
        for (let [key, value] of this._eventStreams) {
            if (key.startsWith(eventType)) {
                return true;
            }
        }
        return false;
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
    /**
     * inspects the given eventType to see if there is additional metadata regarding model changed events
     */
    private _destructEventType(eventType: EventType): { eventType: string, modelChangedEvent_observedModelId?: string } {
        if (isStringEventType(eventType)) {
            if (eventType === Consts.modelChangedEvent) {
                // tslint:disable-next-line:max-line-length
                throw new Error("You can not observe a modelChangedEvent using only the eventType string. You must pass an object identifying the modelId to monitor. E.g. replace the eventType param with: { eventType: 'modelChangedEvent', modelId: 'yourRelatedModelId' }");
            }
            return {
                eventType: eventType
            };
        } else if (isModelChangedEventType(eventType)) {
            return {
                eventType: Consts.modelChangedEvent,
                // this needs to be stored later so we don't enqueue model changed events we're not watching,
                // thus triggering a dispatch cycle for nothing and then follow on model changed events (tight loop)
                modelChangedEvent_observedModelId: eventType.modelId
            };
        } else {
            // tslint:disable-next-line:max-line-length
            throw new Error(`Unsupported eventType passed to the router. \'eventType\' must be a string. The only exception is when observing the built in ${Consts.modelChangedEvent}, in which case it must be an object of this shape: { eventType: 'modelChangedEvent', modelId: 'yourRelatedModelId' }`);
        }
    }
}