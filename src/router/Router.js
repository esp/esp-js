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

import EventContext from './EventContext';
import ObservationStage from './ObservationStage';
import ModelRecord from './ModelRecord';
import State from './State.js';
import Status from './Status.js';
import { CompositeDiagnosticMonitor } from './devtools';
import { default as SingleModelRouter } from './SingleModelRouter.js';
import { events, DisposableBase } from '../model';
import { Subject, Observable } from '../reactive/index';
import { Guard, utils, logging, disposables } from '../system';

var _log = logging.Logger.create('Router');

export default class Router extends DisposableBase {
    constructor() {
        super();
        this._models = {};
        this._modelUpdateSubjects = {};
        this._modelEventSubjects = {};
        this._haltingException = undefined;
        this._state = new State();
        this._diagnosticMonitor = new CompositeDiagnosticMonitor();
        this.addDisposable(this._diagnosticMonitor);
    }
    addModel(modelId, model, options) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(modelId, 'The modelId argument should be a string');
        Guard.isDefined(model, 'THe model argument must be defined');
        if(options) Guard.isObject(options, 'The options argument should be an object');
        Guard.isFalsey(this._models[modelId], 'The model with id [' + modelId + '] is already registered');
        this._models[modelId] = new ModelRecord(modelId, model, options);
        this._diagnosticMonitor.addModel(modelId);
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
        this._throwIfHaltedOrDisposed();
        if (this._state.currentStatus === Status.EventExecution) {
            throw new Error('You can not publish further events when performing an event execution. modelId1: [' + modelId + '], eventType:[' + eventType + ']');
        }
        this._diagnosticMonitor.publishEvent(modelId, eventType, event);
        this._tryEnqueueEvent(modelId, eventType, event);
    }
    broadcastEvent(eventType, event) {
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        this._diagnosticMonitor.broadcastEvent(eventType);
        for (let modelId in this._models) {
            if (this._models.hasOwnProperty(modelId)) {
                this._tryEnqueueEvent(modelId, eventType, event);
            }
        }
        try {
            this._purgeEventQueues();
        } catch (err) {
            this._halt(err);
        }
    }
    executeEvent(eventType, event) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        this._diagnosticMonitor.executingEvent(eventType);
        this._state.executeEvent(() => {
            this._dispatchEventToEventProcessors(
                this._state.currentModelId,
                this._state.currentModel,
                event,
                eventType
            );
        });
    }
    runAction(modelId, action) {
        this._throwIfHaltedOrDisposed();
        this._diagnosticMonitor.runAction(modelId);
        let modelRecord = this._models[modelId];
        if (typeof modelRecord === 'undefined') {
            throw new Error('Can not run action as model with id [' + modelId + '] not registered');
        } else {
            modelRecord.eventQueue.push({eventType: '__runAction', action: action});
            try {
                this._purgeEventQueues();
            } catch (err) {
                this._halt(err);
            }
        }
    }
    getEventObservable(modelId, eventType, stage) {
        return Observable.create(o => {
            this._throwIfHaltedOrDisposed();
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
            this._throwIfHaltedOrDisposed();
            Guard.isString(modelId, 'The modelId should be a string');
            let updateSubject = this._getModelUpdateSubjects(modelId);
            return updateSubject.observe(o);
        });
    }
    createModelRouter(targetModelId) {
        Guard.isString(targetModelId, 'The targetModelId argument should be a string');
        return SingleModelRouter.createWithRouter(this, targetModelId);
    }
    observeEventsOn(modelId, object, methodPrefix='_observe_') {
        if(object._espDecoratorMetadata) {
            return this._observeEventsUsingDirectives(modelId, object, methodPrefix);
        } else {
            return this._observeEventsUsingConventions(modelId, object, methodPrefix);
        }
    }
    getDispatchLoopDiagnostics () {
        return this._diagnosticMonitor.getLoggingDiagnosticSummary();
    }
    enableDiagnostics() {
        this._diagnosticMonitor.enableLoggingDiagnostic();
    }
    disableDiagnostics() {
        this._diagnosticMonitor.disableLoggingDiagnostic();
    }
    _tryEnqueueEvent(modelId, eventType, event) {
        // don't enqueue a model changed event for the same model that changed
        if(eventType === 'modelChangedEvent' && event.modelId === modelId)
            return; 
        let modelRecord = this._models[modelId];
        if (typeof modelRecord === 'undefined') {
            throw new Error('Can not publish event of type [' + eventType + '] as model with id [' + modelId + '] not registered');
        } else {
            try {
                let shouldEnqueue = false;
                let modelEventSubject = this._modelEventSubjects[modelId];
                // only enqueue if the model has observers for the given event type
                if (typeof modelEventSubject !== 'undefined') {
                    if(modelEventSubject.hasOwnProperty(eventType)) {
                        shouldEnqueue = true;
                    }
                }
                if(shouldEnqueue) {
                    this._diagnosticMonitor.eventEnqueued(modelId, eventType);
                    modelRecord.eventQueue.push({eventType: eventType, event: event});
                    this._purgeEventQueues();
                } else {
                    this._diagnosticMonitor.eventIgnored(modelId, eventType);
                }
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
    _getModelUpdateSubjects(modelId) {
        let updateSubject = this._modelUpdateSubjects[modelId];
        if (typeof updateSubject === 'undefined') {
            updateSubject = new Subject(true);
            this._modelUpdateSubjects[modelId] = updateSubject;
        }
        return updateSubject;
    }
    _purgeEventQueues() {
        if (this._state.currentStatus === Status.Idle) {
            let modelRecord = this._getNextModelRecordWithQueuedEvents();
            let hasEvents = typeof modelRecord !== 'undefined';
            this._diagnosticMonitor.dispatchLoopStart();
            while (hasEvents) {
                while (hasEvents) {
                    let eventRecord = modelRecord.eventQueue.shift();
                    this._diagnosticMonitor.startingModelEventLoop(modelRecord.modelId, eventRecord.eventType);
                    this._state.moveToPreProcessing(modelRecord.modelId, modelRecord.model);
                    if (modelRecord.model.unlock && typeof modelRecord.model.unlock === 'function') {
                        modelRecord.model.unlock();
                    }
                    this._diagnosticMonitor.preProcessingModel();
                    modelRecord.runPreEventProcessor(modelRecord.model);
                    if (!modelRecord.wasRemoved) {
                        this._state.moveToEventDispatch();
                        this._diagnosticMonitor.dispatchingEvents();
                        while (hasEvents) {
                            let wasDispatched = true;
                            if(eventRecord.eventType === '__runAction') {
                                this._diagnosticMonitor.dispatchingAction(modelRecord.modelId);
                                eventRecord.action(modelRecord.model);
                            } else {
                                wasDispatched = this._dispatchEventToEventProcessors(modelRecord.modelId, modelRecord.model, eventRecord.event, eventRecord.eventType);
                            }
                            if (modelRecord.wasRemoved) break;
                            if (!modelRecord.hasChanges && wasDispatched) {
                                modelRecord.hasChanges = true;
                            }
                            hasEvents = modelRecord.eventQueue.length > 0;
                            if (hasEvents) {
                                eventRecord = modelRecord.eventQueue.shift();
                            }
                        } // keep looping until any events from the dispatch to processors stage are processed
                        this._diagnosticMonitor.finishDispatchingEvent();
                        if (!modelRecord.wasRemoved) {
                            this._diagnosticMonitor.postProcessingModel();
                            this._state.moveToPostProcessing();
                            modelRecord.runPostEventProcessor(modelRecord.model);
                            if (modelRecord.model.lock && typeof modelRecord.model.lock === 'function') {
                                modelRecord.model.lock();
                            }
                        }
                    }
                    this.broadcastEvent('modelChangedEvent', new events.ModelChangedEvent(modelRecord.modelId, modelRecord.model, eventRecord.eventType));
                    modelRecord = this._getNextModelRecordWithQueuedEvents();
                    hasEvents = typeof modelRecord !== 'undefined';
                    this._diagnosticMonitor.endingModelEventLoop();
                }  // keep looping until any events raised during post event processing OR event that have come in for other models are processed
                this._state.moveToDispatchModelUpdates();
                this._dispatchModelUpdates();
                modelRecord = this._getNextModelRecordWithQueuedEvents();
                hasEvents = typeof modelRecord !== 'undefined';
            } // keep looping until any events from the dispatch updates stages are processed
            this._state.moveToIdle();
            this._diagnosticMonitor.dispatchLoopEnd();
        }
    }
    _dispatchEventToEventProcessors(modelId, model, event, eventType) {
        let dispatchEvent = (model1, event1, context, subject, stage) => {
            let wasDispatched = false;
            if (subject.getObserverCount() > 0) {
                // note: if the model was removed by an observer the subject will be completed so subsequent observers won't get the event
                this._diagnosticMonitor.dispatchingEvent(eventType, stage);
                subject.onNext(event1, context, model1);
                if(subject.hasError) {
                    throw subject.error;
                }
                wasDispatched = true;
            }
            return wasDispatched;
        };
        let eventContext = new EventContext(
            modelId,
            eventType
        );
        let eventSubjects = this._getModelsEventSubjects(modelId, eventType);
        let wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.preview, ObservationStage.preview);
        if (eventContext.isCommitted) {
            throw new Error('You can\'t commit an event at the preview stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelId + ']');
        }
        if (!eventContext.isCanceled) {
            eventContext._currentStage = ObservationStage.normal;
            wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.normal, ObservationStage.normal);
            if (eventContext.isCanceled) {
                throw new Error('You can\'t cancel an event at the normal stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelId + ']');
            }
            if (wasDispatched && eventContext.isCommitted) {
                eventContext._currentStage = ObservationStage.committed;
                dispatchEvent(model, event, eventContext, eventSubjects.committed, ObservationStage.committed);
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
            let modelId = updates[i].modelId;
            modelUpdateSubject = this._getModelUpdateSubjects(modelId);
            this._diagnosticMonitor.dispatchingModelUpdates(modelId);
            modelUpdateSubject.onNext(updates[i].model);
            if(modelUpdateSubject.hasError) {
                throw modelUpdateSubject.error;
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
    _observeEventsUsingDirectives(modelId, object){
        var compositeDisposable = new disposables.CompositeDisposable();
        for (var i = 0; i < object._espDecoratorMetadata.events.length; i ++) {
            let details = object._espDecoratorMetadata.events[i];
            compositeDisposable.add(this.getEventObservable(modelId, details.eventName, details.observationStage).observe((e, c, m) => {
                // note if the code is uglifyied then details.functionName isn't going to mean much.
                // If you're packing your vendor bundles, or debug bundles separately then you can use the no-mangle-functions option to retain function names.
                this._diagnosticMonitor.dispatchingViaDirective(details.functionName);
                object[details.functionName](e, c, m);
            }));
        }
        return compositeDisposable;
    }
    _observeEventsUsingConventions(modelId, object, methodPrefix) {
        var compositeDisposable = new disposables.CompositeDisposable();
        var props = utils.getPropertyNames(object);
        for (var i = 0; i < props.length; i ++) {
            let prop = props[i];
            if(utils.startsWith(prop, methodPrefix)) {
                let stage = ObservationStage.normal;
                let eventName = prop.replace(methodPrefix, '');
                let observationStageSplitIndex = eventName.lastIndexOf('_');
                if(observationStageSplitIndex > 0) {
                    let stageSubstring = eventName.substring(observationStageSplitIndex + 1);
                    let stageSpecified = false;
                    if(stageSubstring === ObservationStage.preview) {
                        stage = ObservationStage.preview;
                        stageSpecified = true;
                    } else if (stageSubstring === ObservationStage.normal) {
                        stage = ObservationStage.normal;
                        stageSpecified = true;
                    } else if (stageSubstring === ObservationStage.committed) {
                        stage = ObservationStage.committed;
                        stageSpecified = true;
                    }
                    if(stageSpecified){
                        eventName = eventName.substring(0, observationStageSplitIndex);
                    }
                }
                compositeDisposable.add(this.getEventObservable(modelId, eventName, stage).observe((e, c, m) => {
                    this._diagnosticMonitor.dispatchingViaConvention(prop);
                    object[prop](e, c, m);
                }));
            }
        }
        return compositeDisposable;
    }
    _throwIfHaltedOrDisposed() {
        if (this._state.currentStatus === Status.Halted) {
            throw new Error(`Event router halted due to previous error [${this._haltingException}]`);
        }
        if(this.isDisposed) {
            throw new Error(`ESP router has been disposed`);
        }
    }
    _halt(err) {
        this._state.moveToHalted();
        let modelIds = Object.keys(this._models);
        this._diagnosticMonitor.halted(modelIds, err);
        _log.error('Router halted error: [{0}]', err);
        this._haltingException = err;
        throw err;
    }
}