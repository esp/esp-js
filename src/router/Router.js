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

import { Const, Status, State, ModelRecord, ObservationStage, EventContext, SingleModelRouter } from './';
import { CompositeDiagnosticMonitor } from './devtools';
import { default as ModelChangedEvent } from './ModelChangedEvent';
import { Subject, Observable } from '../reactive/index';
import { Guard, utils, logging, WeakMapPollyFill } from '../system';
import { DisposableBase, CompositeDisposable } from '../system/disposables';
import { EspDecoratorMetadata } from '../decorators';
import DecoratorObservationRegister from "./DecoratorObservationRegister";
import RouterSubject from '../reactive/RouterSubject';

var _log = logging.Logger.create('Router');

export default class Router extends DisposableBase {
    constructor() {
        super();
        this._models = {};
        this._modelUpdateSubjects = {};
        this._modelEventSubjects = {};
        this._haltingException = undefined;
        this._state = new State();

        this._onErrorHandlers = [];

        this._diagnosticMonitor = new CompositeDiagnosticMonitor();
        this.addDisposable(this._diagnosticMonitor);

        this._decoratorObservationRegister = new DecoratorObservationRegister();
    }
    addModel(modelId, model, options) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(modelId, 'The modelId argument should be a string');
        Guard.isDefined(model, 'The model argument must be defined');
        if(options) Guard.isObject(options, 'The options argument should be an object');
        Guard.isFalsey(this._models[modelId], 'The model with id [' + modelId + '] is already registered');
        this._models[modelId] = new ModelRecord(modelId, model, options);
        let modelUpdateSubject = this._getModelUpdateSubjects(modelId);
        modelUpdateSubject.onNext(model);
        this._diagnosticMonitor.addModel(modelId);
    }
    removeModel(modelId){
        Guard.isString(modelId, 'The modelId argument should be a string');
        let modelRecord = this._models[modelId];
        if(modelRecord){
            this._diagnosticMonitor.removeModel(modelId);
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
    isModelRegistered(modelId) {
        Guard.isString(modelId, 'The modelId argument should be a string');
        return !!this._models[modelId];
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
        Guard.isString(modelId, 'modelId must be a string');
        Guard.isTrue(modelId !== '', 'modelId must not be empty');
        Guard.isFunction(action, 'the argument passed to runAction must be a function and can not be null|undefined');
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
            let subjects = this._getOrCreateModelsEventSubjects(modelId, eventType);
            let subject = subjects[stage];
            return subject.subscribe(o);
        });
    }
    getModelObservable(modelId) {
        return Observable.create(o => {
            this._throwIfHaltedOrDisposed();
            Guard.isString(modelId, 'The modelId should be a string');
            let updateSubject = this._getModelUpdateSubjects(modelId);
            return updateSubject.subscribe(o);
        });
    }
    createObservableFor(modelId, observer) {
        return Observable
            .create(observer)
            .asRouterObservable(this)
            .subscribeOn(modelId);
    }
    createSubject() {
        return new RouterSubject(this);
    }
    createModelRouter(targetModelId) {
        Guard.isString(targetModelId, 'The targetModelId argument should be a string');
        return SingleModelRouter.createWithRouter(this, targetModelId);
    }
    observeEventsOn(modelId, object, methodPrefix='_observe_') {
        if(EspDecoratorMetadata.hasMetadata(object)) {
            return this._observeEventsUsingDirectives(modelId, object, methodPrefix);
        } else {
            return this._observeEventsUsingConventions(modelId, object, methodPrefix);
        }
    }
    addOnErrorHandler(handler) {
        this._onErrorHandlers.push(handler);
    }
    removeOnErrorHandler(handler) {
        let index = this._onErrorHandlers.indexOf(handler);
        if(index >= 0) {
            delete this._onErrorHandlers[index];
        } else {
            throw new Error('Unknown error handler.');
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
    isOnDispatchLoopFor(modelId) {
        Guard.isString(modelId, 'modelId must be a string');
        Guard.isFalsey(modelId === '', 'modelId must not be empty');
        return this._state.currentModelId === modelId;
    }
    _tryEnqueueEvent(modelId, eventType, event) {
        // don't enqueue a model changed event for the same model that changed
        if(eventType === Const.modelChangedEvent  && event.modelId === modelId)
            return; 
        let modelRecord = this._models[modelId];
        if (typeof modelRecord === 'undefined') {
            throw new Error('Can not publish event of type [' + eventType + '] as model with id [' + modelId + '] not registered');
        } else {
            try {
                let shouldEnqueue = false;
                let modelEventSubject = this._modelEventSubjects[modelId];
                // only enqueue if we have a model
                if (typeof modelEventSubject !== 'undefined') {
                    let eventSubjects = modelEventSubject[eventType];
                    // and that model has event observers for the event in question
                    if(typeof eventSubjects !== 'undefined') {
                        // and finally, if any custom predicates registered with the event allows enqueuing
                        if(eventSubjects.shouldEnqueue(modelId, eventType, event)) {
                            shouldEnqueue = true;
                        }
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
    _tryGetModelsEventSubjects(modelId, eventType) {
        let eventSubjects = null;
        let modelEventSubject = this._modelEventSubjects[modelId];
        if (typeof modelEventSubject !== 'undefined') {
            eventSubjects = modelEventSubject[eventType];
        }
        return eventSubjects;
    }
    _getOrCreateModelsEventSubjects(modelId, eventType) {
        let { shouldEnqueuePredicate, underlyingEventType } = this._destructEventType(eventType);
        let modelEventSubject = this._modelEventSubjects[modelId];
        if (typeof modelEventSubject === 'undefined') {
            modelEventSubject = {};
            this._modelEventSubjects[modelId] = modelEventSubject;
        }
        let subjects = modelEventSubject[underlyingEventType];
        if (typeof subjects === 'undefined') {
            subjects = {
                preview: new Subject(),
                normal: new Subject(),
                committed: new Subject(),
                shouldEnqueue : shouldEnqueuePredicate
            };
            modelEventSubject[underlyingEventType] = subjects;
        }
        return subjects;
    }
    /**
     * inspects the given eventType to see if there is additional metadata that should be used by the router
     * when it's dispatching the event in question
     */
    _destructEventType(eventType) {
        let shouldEnqueuePredicate;
        let underlyingEventType;
        if(utils.isString(eventType)) {
            if(eventType === Const.modelChangedEvent) {
                throw new Error("You can not observe a modelChangedEvent using only the eventType string. You must pass an object identifying the modelId to monitor. E.g. replace the eventType param with: { eventType: 'modelChangedEvent', modelId: 'yourRelatedModelId' }");
            }
            // if the proved eventType is a simple string we simply use the string as the underlyingEventType
            shouldEnqueuePredicate = () => true;
            underlyingEventType = eventType;
        } else if (eventType.hasOwnProperty('eventType') && eventType.hasOwnProperty('modelId') && eventType.eventType == Const.modelChangedEvent) {
            // if the event type is something else
            underlyingEventType = eventType.eventType;
            shouldEnqueuePredicate = (modelId, eventType1, event) => {
                if(eventType1 === Const.modelChangedEvent) {
                    return event.modelId === eventType.modelId;
                } else {
                    return true;
                }
            };
        } else {
            throw new Error(`Unsupported eventType passed to the router. \'eventType\' must be a string. The only exception is when observing the built in ${Const.modelChangedEvent}, in which case it must be an object of this shape: { eventType: 'modelChangedEvent', modelId: 'yourRelatedModelId' }`);
        }
        return {
            shouldEnqueuePredicate: shouldEnqueuePredicate,
            underlyingEventType: underlyingEventType
        };
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
                        if (eventRecord.eventType === '__runAction') {
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
                this.broadcastEvent(Const.modelChangedEvent, new ModelChangedEvent(modelRecord.modelId, modelRecord.model));
                // we now dispatch updates before processing the next model, if any
                this._state.moveToDispatchModelUpdates();
                this._dispatchModelUpdates();
                modelRecord = this._getNextModelRecordWithQueuedEvents();
                hasEvents = typeof modelRecord !== 'undefined';
                this._diagnosticMonitor.endingModelEventLoop();
            }  // keep looping until any events raised during post event processing OR event that have come in for other models are processed
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
        let wasDispatched = false;
        let eventSubjects =  this._tryGetModelsEventSubjects(modelId, eventType);
        if (eventSubjects !== null) {
            wasDispatched = dispatchEvent(model, event, eventContext, eventSubjects.preview, ObservationStage.preview);
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
        if (this._decoratorObservationRegister.isRegistered(modelId, object)) {
            throw new Error(`observeEventsOn has already been called for model with id '${modelId}' and the given object. Note you can observe the same model with different decorated objects, however you have called observeEventsOn twice with the same object.`);
        }
        this._decoratorObservationRegister.register(modelId, object);
        var compositeDisposable = new CompositeDisposable();
        var eventsDetails = EspDecoratorMetadata.getAllEvents(object);
        for (var i = 0; i < eventsDetails.length; i ++) {
            let details = eventsDetails[i];
            compositeDisposable.add(this.getEventObservable(modelId, details.eventName, details.observationStage).subscribe((e, c, m) => {
                // note if the code is uglifyied then details.functionName isn't going to mean much.
                // If you're packing your vendor bundles, or debug bundles separately then you can use the no-mangle-functions option to retain function names.
                if(!details.predicate || details.predicate(object, e)) {
                    this._diagnosticMonitor.dispatchingViaDirective(details.functionName);
                    object[details.functionName](e, c, m);
                }
            }));
        }
        compositeDisposable.add(() => {
            delete this._decoratorObservationRegister.removeRegistration(modelId, object);
        });
        return compositeDisposable;
    }

    _observeEventsUsingConventions(modelId, object, methodPrefix) {
        var compositeDisposable = new CompositeDisposable();
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
                compositeDisposable.add(this.getEventObservable(modelId, eventName, stage).subscribe((e, c, m) => {
                    this._diagnosticMonitor.dispatchingViaConvention(prop);
                    object[prop](e, c, m);
                }));
            }
        }
        return compositeDisposable;
    }
    _throwIfHaltedOrDisposed() {
        if (this._state.currentStatus === Status.Halted) {
            throw new Error(`ESP router halted due to previous unhandled error [${this._haltingException}]`, this._haltingException);
        }
        if(this.isDisposed) {
            throw new Error(`ESP router has been disposed`);
        }
    }
    _halt(err) {
        let isInitialHaltingError = this._state.currentStatus !== Status.Halted;

        this._state.moveToHalted();

        let modelIds = Object.keys(this._models);
        this._diagnosticMonitor.halted(modelIds, err);
        _log.error('The ESP router has caught an unhandled error and will halt', err);
        this._haltingException = err;

        // We run the onErrorHandlers after the
        // router has had time to set it's own state
        if(isInitialHaltingError) {
            this._onErrorHandlers.forEach(handler => {
                try {
                    handler(err);
                }
                catch(handlerError) {
                    _log.info(`Error handler errored. Ignoring and continuing, Error = ${handlerError}`, handlerError);
                }
            })
        }

        throw err;
    }
}
