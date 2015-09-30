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

import EventContext from './EventContext';
import ObservationStage from './ObservationStage';
import ModelRecord from './ModelRecord';
import State from './State.js';
import Status from './Status.js';
import ModelRouter from './ModelRouter.js';
import { Subject, Observable } from '../reactive/index';
import { ModelChangedEvent } from '../model/events/index';
import { Guard, utils, logger } from '../system';

var _log = logger.create('Router');

export default class Router {
    constructor() {
        this._models = {};
        this._modelUpdateSubjects = {};
        this._modelEventSubjects = {};
        this._haltingException = undefined;
        this._state = new State();
    }
    registerModel(modelId, model, options) {
        this._throwIfHalted();
        Guard.isString(modelId, 'The modelId argument should be a string');
        Guard.isDefined(model, 'THe model argument must be defined');
        if(options) Guard.isObject(options, 'The options argument should be an object');
        Guard.isFalsey(this._models[modelId], 'The model with id [' + modelId + '] is already registered');
        this._models[modelId] = new ModelRecord(modelId, model, options);
    }  
    removeModel(modelId){
        Guard.isString(modelId, 'The modelId argument should be a string');
        let modelRecord = this._models[modelId];
        if(modelRecord){
            modelRecord.wasRemoved = true;
            delete this._models[modelId];
            modelRecord.eventQueue.length = 0;
            let modelUpdateSubjects = this._modelUpdateSubjects[modelId];
            if(modelUpdateSubjects) {
                delete this._modelUpdateSubjects[modelId];
                modelUpdateSubjects.onCompleted();
            }
            let modelEventSubjects = this._modelEventSubjects[modelId];
            if(modelEventSubjects) {
                delete this._modelEventSubjects[modelId];
                for (let p in modelEventSubjects) {
                    if(modelEventSubjects.hasOwnProperty(p)) {
                        let eventSubjects = modelEventSubjects[p];
                        eventSubjects.preview.onCompleted();
                        eventSubjects.normal.onCompleted();
                        eventSubjects.committed.onCompleted();
                    }
                }
            }
        }
    }
    publishEvent(modelId, eventType, event) {
        Guard.isString(modelId, 'The modelId argument should be a string');
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument must be defined');
        this._throwIfHalted();
        if (this._state.currentStatus === Status.EventExecution) {
            throw new Error('You can not publish further events when performing an event execution. modelId1: [' + modelId + '], eventType:[' + eventType + ']');
        }
        this._eventQueue(modelId, eventType, event);
        this._purgeEventQueues();
    }
    broadcastEvent(eventType, event) {
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        for (let modelId in this._models) {
            if (this._models.hasOwnProperty(modelId)) {
                this._eventQueue(modelId, eventType, event);
            }
        }
        this._purgeEventQueues();
    }
    executeEvent(eventType, event) {
        this._throwIfHalted();
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');

        this._state.executeEvent(() => {
            let eventContext = new EventContext(
                this._state.currentModelId,
                eventType,
                event
            );
            this._dispatchEventToEventProcessors(
                this._state.currentModelId,
                this._state.currentModel,
                event,
                eventType,
                eventContext
            );
        });
    }
    getEventObservable(modelId, eventType, stage) {
        return Observable.create(o => {
            this._throwIfHalted();
            Guard.isString(modelId, 'The modelId argument should be a string');
            Guard.isDefined(modelId, 'The modelId argument should be defined');
            Guard.isDefined(eventType, 'The eventType argument should be defined');

            if(stage) {
                Guard.isString(stage, 'The stage argument should be a string');
                Guard.isTrue(stage === ObservationStage.preview || stage === ObservationStage.normal || stage === ObservationStage.committed, 'The stage argument value of [' + stage + '] is incorrect. It should be preview, normal or committed.');
            } else {
                stage = ObservationStage.normal;
            }
            let subjects = this._getModelsEventSubjects(modelId, eventType);
            let subject = subjects[stage];
            return subject.observe(o);
        });
    }
    getModelObservable(modelId) {
        return Observable.create(o => {
            this._throwIfHalted();
            Guard.isString(modelId, 'The modelId should be a string');

            let updateSubject = this._modelUpdateSubjects[modelId];
            if (typeof updateSubject === 'undefined') {
                updateSubject = new Subject();
                this._modelUpdateSubjects[modelId] = updateSubject;
            }
            return updateSubject.observe(o);
        });
    }
    createModelRouter(targetModelId) {
        Guard.isString(targetModelId, 'The targetModelId argument should be a string');
        return new ModelRouter(this, targetModelId);
    }
    _eventQueue(modelId, eventType, event) {
        // don't enqueue a model changed event for the same model that changed
        if(eventType === 'modelChangedEvent' && event.modelId === modelId)
            return;
        let modelRecord = this._models[modelId];
        if (typeof modelRecord === 'undefined') {
            throw new Error('Can not publish event of type [' + eventType + '] as model with id [' + modelId + '] not registered');
        } else {
            try {
                let subjects = this._getModelsEventSubjects(modelId, eventType);
                // only enqueue if the model has observers for the given event type
                if(subjects.hasOwnProperty(eventType)) {
                    modelRecord.eventQueue.push({eventType: eventType, event: event});
                }
                this._purgeEventQueues();
            } catch (err) {
                this._halt(err);
            }
        }
    }
    _getModelsEventSubjects(modelId, eventType) {
        let modelEventSubject = this._modelEventSubjects[modelId];
        if (typeof modelEventSubject === 'undefined') {
            modelEventSubject = {};
            this._modelEventSubjects[modelId] = modelEventSubject;
        }
        let subjects = modelEventSubject[eventType];
        if (typeof subjects === 'undefined') {
            subjects = {
                preview: new Subject(),
                normal: new Subject(),
                committed: new Subject()
            };
            modelEventSubject[eventType] = subjects;
        }
        return subjects;
    }
    _purgeEventQueues() {
        if (this._state.currentStatus === Status.Idle) {
            let modelRecord = this._getNextModelRecordWithQueuedEvents();
            let hasEvents = true;

            // TODO -> Explanation of why we have the two while loops
            while (hasEvents) {
                while (hasEvents) {
                    this._state.moveToPreProcessing(modelRecord.modelId, modelRecord.model);
                    let eventRecord = modelRecord.eventQueue.shift();
                    if (modelRecord.model.unlock && typeof modelRecord.model.unlock === 'function') {
                        modelRecord.model.unlock();
                    }
                    var eventContext = new EventContext(modelRecord.modelId, eventRecord.eventType, eventRecord.event);
                    modelRecord.runPreEventProcessor(modelRecord.model, eventRecord.event, eventContext);
                    if (!modelRecord.wasRemoved) {
                        if (!eventContext.isCanceled) {
                            this._state.moveToEventDispatch();
                            while (hasEvents) {
                                let wasDispatched = this._dispatchEventToEventProcessors(modelRecord.modelId, modelRecord.model, eventRecord.event, eventRecord.eventType, eventContext);
                                if (modelRecord.wasRemoved) break;
                                if (!modelRecord.hasChanges && wasDispatched) {
                                    modelRecord.hasChanges = true;
                                }
                                hasEvents = modelRecord.eventQueue.length > 0;
                                if (hasEvents) {
                                    eventRecord = modelRecord.eventQueue.shift();
                                    eventContext = new EventContext(modelRecord.modelId, eventRecord.eventType, eventRecord.event);
                                }
                            } // keep looping until any events from the dispatch to processors stage are processed
                        }
                        if (!modelRecord.wasRemoved) {
                            this._state.moveToPostProcessing();
                            modelRecord.runPostEventProcessor(modelRecord.model, eventRecord.event, eventContext);
                            if (modelRecord.model.lock && typeof modelRecord.model.lock === 'function') {
                                modelRecord.model.lock();
                            }
                        }
                    }
                    this.broadcastEvent('modelChangedEvent', new ModelChangedEvent(modelRecord.modelId, eventRecord.eventType));
                    modelRecord = this._getNextModelRecordWithQueuedEvents();
                    hasEvents = typeof modelRecord !== 'undefined';
                }  // keep looping until any events raised during post event processing OR event that have come in for other models are processed
                this._state.moveToDispatchModelUpdates();
                this._dispatchModelUpdates();
                modelRecord = this._getNextModelRecordWithQueuedEvents();
                hasEvents = typeof modelRecord !== 'undefined';
            } // keep looping until any events from the dispatch updates stages are processed
            this._state.moveToIdle();
        }
    }
    _dispatchEventToEventProcessors(modelId, model, event, eventType, eventContext) {
        let dispatchEvent = (model1, event1, context, subject) => {
            let wasDispatched = false;
            if (subject.getObserverCount() > 0) {
                // note: if the model was removed by an observer the subject will be completed so subsequent observers won't get the event
                subject.onNext(model1, event1, context);
                if(subject.hasError) {
                    throw subject.error;
                }
                wasDispatched = true;
            }
            return wasDispatched;
        };

        let eventSubjects = this._getModelsEventSubjects(modelId, eventType);
        let wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.preview);
        if (eventContext.isCommitted) {
            throw new Error('You can\'t commit an event at the preview stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelId + ']');
        }
        if (!eventContext.isCanceled) {
            wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.normal);
            if (eventContext.isCanceled) {
                throw new Error('You can\'t cancel an event at the normal stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelId + ']');
            }
            if (wasDispatched && eventContext.isCommitted) {
                dispatchEvent(model, event, eventContext, eventSubjects.committed);
                if (eventContext.isCanceled) {
                    throw new Error('You can\'t cancel an event at the committed stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelId + ']');
                }
            }
        }
        return wasDispatched;
    }
    _dispatchModelUpdates() {
        let updates = [], modelUpdateSubject;
        for (let modelId in this._models) {
            if (this._models.hasOwnProperty(modelId)) {
                let modelRecord = this._models[modelId];
                if (modelRecord.hasChanges) {
                    modelRecord.hasChanges = false;
                    updates.push(modelRecord);
                }
            }
        }
        for (let i = 0, len = updates.length; i < len; i++) {
            modelUpdateSubject = this._modelUpdateSubjects[updates[i].modelId];
            if (typeof modelUpdateSubject !== 'undefined') {
                modelUpdateSubject.onNext(updates[i].model);
                if(modelUpdateSubject.hasError) {
                    throw modelUpdateSubject.error;
                }
            }
        }
    }
    _getNextModelRecordWithQueuedEvents() {
        let nextModel;
        for (let modelId in this._models) {
            if (this._models.hasOwnProperty(modelId)) {
                let current = this._models[modelId];
                if (current.eventQueue.length > 0) {
                    nextModel = current;
                    break;
                }
            }
        }
        return nextModel;
    }
    _throwIfHalted() {
        if (this._state.currentStatus === Status.Halted) {
            let message = utils.format('Event router halted due to previous error [{0}]', this._haltingException);
            throw new Error(message);
        }
    }
    _halt(err) {
        this._state.moveToHalted();
        _log.error('Router halted error: [{0}]', err);
        this._haltingException = err;
        throw err;
    }
}