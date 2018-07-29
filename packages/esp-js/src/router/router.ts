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

import {Consts, Status, State, ModelRecord, ObservationStage, EventContext, SingleModelRouter} from './';
import {ModelChangedEvent} from './modelChangedEvent';
import {Subject, Observable} from '../reactive';
import {Guard, utils, logging} from '../system';
import {DisposableBase, CompositeDisposable} from '../system/disposables';
import {EspDecoratorMetadata} from '../decorators';
import {DecoratorObservationRegister} from './decoratorObservationRegister';
import {RouterSubject} from '../reactive';
import {RouterObservable} from '../reactive';
import {CompositeDiagnosticMonitor} from './devtools';
import {ModelOptions} from './modelOptions';
import {EventEnvelope, ModelEnvelope} from './envelopes';
import {DispatchType} from './envelopes';
import {EventStreamsRegistration} from './modelRecord';
import {DefaultEventContext, ModelChangedEventContext} from './eventContext';
import {DecoratorTypes} from '../decorators/espDecoratorMetadata';

let _log = logging.Logger.create('Router');

type Envelope = ModelEnvelope<any> | EventEnvelope<any, any>;

export class Router extends DisposableBase {
    private _models: Map<string, ModelRecord>;
    private _dispatchSubject: Subject<Envelope>;
    private _haltingException: Error;
    private _state: State;
    private _onErrorHandlers: Array<(error: Error) => void>;
    private _diagnosticMonitor: CompositeDiagnosticMonitor;
    private _decoratorObservationRegister: DecoratorObservationRegister;

    public constructor() {
        super();
        this._models = new Map();
        this._haltingException = undefined;
        this._dispatchSubject = new Subject<Envelope>();
        this._onErrorHandlers = [];

        this._diagnosticMonitor = new CompositeDiagnosticMonitor();
        this.addDisposable(this._diagnosticMonitor);

        this._state = new State(this._diagnosticMonitor);

        this._decoratorObservationRegister = new DecoratorObservationRegister();
    }

    public addModel(modelId: string, model: any, options?: ModelOptions) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(modelId, 'The modelId argument should be a string');
        Guard.isDefined(model, 'The model argument must be defined');
        if (options) {
            Guard.isObject(options, 'The options argument should be an object');
        }
        Guard.isFalsey(this._models.has(modelId), 'The model with id [' + modelId + '] is already registered');
        this._getOrCreateModelRecord(modelId, model, options);
        this._dispatchSubject.onNext({modelId: modelId, model: model, dispatchType: DispatchType.Model});
        this._diagnosticMonitor.addModel(modelId);
    }

    public removeModel(modelId: string) {
        Guard.isString(modelId, 'The modelId argument should be a string');
        let modelRecord = this._models.get(modelId);
        if (modelRecord) {
            this._diagnosticMonitor.removeModel(modelId);
            modelRecord.wasRemoved = true;
            this._models.delete(modelId);
            modelRecord.dispose();
        }
    }

    public isModelRegistered(modelId: string): boolean {
        Guard.isString(modelId, 'The modelId argument should be a string');
        return this._models.has(modelId);
    }

    public publishEvent(modelId: string, eventType: string, event: any) {
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

    public broadcastEvent(eventType: string, event: any) {
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        this._diagnosticMonitor.broadcastEvent(eventType);
        for (let [key, value] of this._models) {
            this._tryEnqueueEvent(value.modelId, eventType, event);
        }
        try {
            this._purgeEventQueues();
        } catch (err) {
            this._halt(err);
        }
    }

    public executeEvent(eventType: string, event: any) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        this._diagnosticMonitor.executingEvent(eventType);
        this._state.executeEvent(() => {
            this._dispatchEventToEventProcessors(
                this._state.currentModelRecord,
                event,
                eventType
            );
        });
    }

    public runAction<TModel>(modelId: string, action: (model: TModel) => void) {
        this._throwIfHaltedOrDisposed();
        Guard.isString(modelId, 'modelId must be a string');
        Guard.isTrue(modelId !== '', 'modelId must not be empty');
        Guard.isFunction(action, 'the argument passed to runAction must be a function and can not be null|undefined');
        this._diagnosticMonitor.runAction(modelId);
        let modelRecord = this._models.get(modelId);
        if (!modelRecord) {
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

    public getEventObservable<TEvent, TModel>(modelId: string, eventType: string, stage?: ObservationStage): Observable<EventEnvelope<TEvent, TModel>> {
        return Observable.create<EventEnvelope<TEvent, TModel>>(o => {
            this._throwIfHaltedOrDisposed();
            this._guardAgainstLegacyModelChangedEventSubscription(eventType);
            Guard.isString(modelId, 'The modelId argument should be a string');
            Guard.isString(eventType, 'The eventType must be a string');
            Guard.isDefined(modelId, 'The modelId argument should be defined');
            if (stage) {
                Guard.isString(stage, 'The stage argument should be a string');
                Guard.isTrue(stage === ObservationStage.preview || stage === ObservationStage.normal || stage === ObservationStage.committed, 'The stage argument value of [' + stage + '] is incorrect. It should be preview, normal or committed.');
            } else {
                stage = ObservationStage.normal;
            }
            let modelRecord = this._getOrCreateModelRecord(modelId);
            let eventStreamDetails: EventStreamsRegistration = modelRecord.getOrCreateEventStreamsRegistration(
                eventType,
                <Observable<EventEnvelope<any, any>>>this._dispatchSubject
            );
            switch (stage) {
                case ObservationStage.preview:
                    return eventStreamDetails.preview.subscribe(o);
                case ObservationStage.normal:
                    return eventStreamDetails.normal.subscribe(o);
                case ObservationStage.committed:
                    return eventStreamDetails.committed.subscribe(o);
                default:
                    throw new Error(`Unknown stage ${stage} requested for eventType ${eventType} and modelId: ${modelId}`);
            }
        });
    }

    public getAllEventsObservable<TModel>(): Observable<EventEnvelope<any, TModel>> {
        return Observable.create(o => {
            this._throwIfHaltedOrDisposed();
            return this._dispatchSubject
                .where(envelope => envelope.dispatchType === DispatchType.Event)
                .cast<EventEnvelope<any, any>>()
                .subscribe(o);
        });
    }

    public getModelChangedEventObservable<TObservingModel, TChangedModel>(observingModelId: string, changedModelId: string): Observable<EventEnvelope<ModelChangedEvent<TChangedModel>, TObservingModel>> {
        return Observable.create<EventEnvelope<ModelChangedEvent<TChangedModel>, TObservingModel>>(o => {
            this._throwIfHaltedOrDisposed();
            Guard.isString(observingModelId, 'The modelId argument should be a string');
            Guard.isString(changedModelId, 'The eventType must be a string');
            const modelRecord = this._getOrCreateModelRecord(observingModelId);
            return this._dispatchSubject
                .cast<EventEnvelope<ModelChangedEvent<TChangedModel>, TObservingModel>>()
                .where(envelope => envelope.dispatchType === DispatchType.ModelChangedEvent && envelope.eventType === Consts.modelChangedEvent && envelope.event.modelId === changedModelId)
                .map(envelope => ({...envelope, modelId: observingModelId, model: modelRecord.model}))
                .asRouterObservable(this)
                .streamFor(observingModelId)
                .subscribe(o);
        });
    }

    public getModelObservable<TModel>(modelId: string): Observable<TModel> {
        return Observable.create(o => {
            this._throwIfHaltedOrDisposed();
            Guard.isString(modelId, 'The modelId should be a string');
            let modelRecord = this._getOrCreateModelRecord(modelId);
            return modelRecord.modelObservationStream.map(envelope => envelope.model).subscribe(o);
        });
    }

    public createObservableFor<TModel>(modelId: string, observer): RouterObservable<TModel> {
        return Observable
            .create<TModel>(observer)
            .asRouterObservable(this)
            .subscribeOn(modelId);
    }

    public createSubject<T>() {
        return new RouterSubject<T>(this);
    }

    public createModelRouter<TModel>(targetModelId: string) {
        Guard.isString(targetModelId, 'The targetModelId argument should be a string');
        return SingleModelRouter.createWithRouter<TModel>(this, targetModelId);
    }

    public observeEventsOn(modelId: string, object: any, methodPrefix = '_observe_') {
        if (EspDecoratorMetadata.hasMetadata(object)) {
            return this._observeEventsUsingDirectives(modelId, object);
        } else {
            return this._observeEventsUsingConventions(modelId, object, methodPrefix);
        }
    }

    public addOnErrorHandler(handler: (error: Error) => void) {
        this._onErrorHandlers.push(handler);
    }

    public removeOnErrorHandler(handler) {
        let index = this._onErrorHandlers.indexOf(handler);
        if (index >= 0) {
            delete this._onErrorHandlers[index];
        } else {
            throw new Error('Unknown error handler.');
        }
    }

    public getDispatchLoopDiagnostics() {
        return this._diagnosticMonitor.getLoggingDiagnosticSummary();
    }

    public get enableDiagnosticLogging() {
        return this._diagnosticMonitor.enableDiagnosticLogging;
    }

    public set enableDiagnosticLogging(isEnabled: boolean) {
        this._diagnosticMonitor.enableDiagnosticLogging = isEnabled;
    }

    public isOnDispatchLoopFor(modelId: string) {
        Guard.isString(modelId, 'modelId must be a string');
        Guard.isFalsey(modelId === '', 'modelId must not be empty');
        return this._state.currentModelId === modelId;
    }

    private _getOrCreateModelRecord(modelId: string, model?: any, options?: ModelOptions) {
        let modelRecord: ModelRecord = this._models.get(modelId);
        if (modelRecord) {
            if (!modelRecord.hasModel) {
                modelRecord.setModel(model, options);
            }
        } else {
            let modelObservationStream =  this._dispatchSubject
                .cast<ModelEnvelope<any>>()
                .where(envelope => envelope.dispatchType === DispatchType.Model && envelope.modelId === modelId)
                .share(true);
            modelRecord = new ModelRecord(modelId, model, modelObservationStream, options);
            this._models.set(modelId, modelRecord);
        }
        return modelRecord;
    }

    private _tryEnqueueEvent(modelId: string, eventType: string, event: any) {
        // don't enqueue a model changed event for the same model that changed
        if (eventType === Consts.modelChangedEvent && event.modelId === modelId) {
            return;
        }
        if (!this._models.has(modelId)) {
            throw new Error('Can not publish event of type [' + eventType + '] as model with id [' + modelId + '] not registered');
        } else {
            try {
                if (this._models.has(modelId)) {
                    let modelRecord = this._getOrCreateModelRecord(modelId);
                    modelRecord.enqueueEvent(eventType, event);
                    this._diagnosticMonitor.eventEnqueued(modelId, eventType);
                    this._purgeEventQueues();
                }
            } catch (err) {
                this._halt(err);
            }
        }
    }

    private _purgeEventQueues() {
        if (this._state.currentStatus === Status.Idle) {
            let modelRecord = this._getNextModelRecordWithQueuedEvents();
            let hasEvents = !!modelRecord;
            this._diagnosticMonitor.dispatchLoopStart();
            while (hasEvents) {
                let eventRecord = modelRecord.eventQueue.shift();
                this._diagnosticMonitor.startingModelEventLoop(modelRecord.modelId, eventRecord.eventType);
                this._state.moveToPreProcessing(modelRecord.modelId, modelRecord);
                if (modelRecord.model.unlock && typeof modelRecord.model.unlock === 'function') {
                    modelRecord.model.unlock();
                }
                this._diagnosticMonitor.preProcessingModel();
                modelRecord.preEventProcessor(modelRecord.model);
                if (!modelRecord.wasRemoved) {
                    this._state.moveToEventDispatch();
                    this._diagnosticMonitor.dispatchingEvents();
                    while (hasEvents) {
                        if (eventRecord.eventType === '__runAction') {
                            this._diagnosticMonitor.dispatchingAction();
                            eventRecord.action(modelRecord.model);
                        } else {
                            this._state.eventsProcessed.push(eventRecord.eventType);
                            this._dispatchEventToEventProcessors(
                                modelRecord,
                                eventRecord.event,
                                eventRecord.eventType);
                        }
                        if (modelRecord.wasRemoved) {
                            break;
                        }
                        modelRecord.hasChanges = true;
                        hasEvents = modelRecord.eventQueue.length > 0;
                        if (hasEvents) {
                            eventRecord = modelRecord.eventQueue.shift();
                        }
                    } // keep looping until any events from the dispatch to processors stage are processed
                    this._diagnosticMonitor.finishDispatchingEvent();
                    if (!modelRecord.wasRemoved) {
                        this._diagnosticMonitor.postProcessingModel();
                        this._state.moveToPostProcessing();
                        modelRecord.postEventProcessor(modelRecord.model, this._state.eventsProcessed);
                        this._state.clearEventDispatchQueue();
                        if (modelRecord.model.lock && typeof modelRecord.model.lock === 'function') {
                            modelRecord.model.lock();
                        }
                    }
                }
                this._dispatchModelChangedEvent(modelRecord);
                // we now dispatch updates before processing the next model, if any
                this._state.moveToDispatchModelUpdates();
                this._dispatchModelUpdates();
                modelRecord = this._getNextModelRecordWithQueuedEvents();
                hasEvents = !!modelRecord;
                this._diagnosticMonitor.endingModelEventLoop();
            }  // keep looping until any events raised during post event processing OR event that have come in for other models are processed
            this._state.moveToIdle();
            this._diagnosticMonitor.dispatchLoopEnd();
        }
    }

    private _dispatchEventToEventProcessors(modelRecord: ModelRecord, event, eventType): void {
        let eventContext = new DefaultEventContext(
            modelRecord.modelId,
            eventType
        );
        this._dispatchEvent(modelRecord, event, eventType, eventContext, ObservationStage.preview);
        if (eventContext.isCommitted) {
            throw new Error('You can\'t commit an event at the preview stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelRecord.modelId + ']');
        }
        if (!eventContext.isCanceled) {
            eventContext.updateCurrentState(ObservationStage.normal);
            this._dispatchEvent(modelRecord, event, eventType, eventContext, ObservationStage.normal);
            if (eventContext.isCanceled) {
                throw new Error('You can\'t cancel an event at the normal stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelRecord.modelId + ']');
            }
            if (eventContext.isCommitted) {
                eventContext.updateCurrentState(ObservationStage.committed);
                this._dispatchEvent(modelRecord, event, eventType, eventContext, ObservationStage.committed);
                if (eventContext.isCanceled) {
                    throw new Error('You can\'t cancel an event at the committed stage. Event: [' + eventContext.eventType + '], ModelId: [' + modelRecord.modelId + ']');
                }
            }
        }
    }

    private _dispatchModelChangedEvent(modelRecordThatChanged: ModelRecord) {
        this._diagnosticMonitor.dispatchingEvent(Consts.modelChangedEvent, ObservationStage.normal);
        this._dispatchSubject.onNext({
            event: new ModelChangedEvent(modelRecordThatChanged.modelId, modelRecordThatChanged.model),
            eventType: Consts.modelChangedEvent,
            modelId: null,
            model: null,
            context: new ModelChangedEventContext(),
            observationStage: ObservationStage.normal,
            dispatchType: DispatchType.ModelChangedEvent
        });
    }

    private _dispatchEvent(modelRecord: ModelRecord, event: any, eventType: string, context: EventContext, stage: ObservationStage) {
        this._diagnosticMonitor.dispatchingEvent(eventType, stage);
        this._dispatchSubject.onNext({
            event: event,
            eventType: eventType,
            modelId: modelRecord.modelId,
            model: modelRecord.model,
            context: context,
            observationStage: stage,
            dispatchType: DispatchType.Event
        });
    }

    private _dispatchModelUpdates() {
        let updates: ModelRecord[] = [];
        for (let [key, value] of this._models) {
            if (value.hasChanges) {
                value.hasChanges = false;
                updates.push(value);
            }
        }
        for (let i = 0, len = updates.length; i < len; i++) {
            let modelRecord: ModelRecord = updates[i];
            this._diagnosticMonitor.dispatchingModelUpdates(modelRecord.modelId);
            this._dispatchSubject.onNext({
                modelId: modelRecord.modelId,
                model: modelRecord.model,
                dispatchType: DispatchType.Model
            });
        }
    }

    private _getNextModelRecordWithQueuedEvents(): ModelRecord {
        for (let [key, value] of this._models) {
            if (value.eventQueue.length > 0) {
                return value;
            }
        }
        return null;
    }

    private _observeEventsUsingDirectives(modelId: string, object: any) {
        if (this._decoratorObservationRegister.isRegistered(modelId, object)) {
            // tslint:disable-next-line:max-line-length
            throw new Error(`observeEventsOn has already been called for model with id '${modelId}' and the given object. Note you can observe the same model with different decorated objects, however you have called observeEventsOn twice with the same object.`);
        }
        this._decoratorObservationRegister.register(modelId, object);
        let compositeDisposable = new CompositeDisposable();
        let eventsDetails = EspDecoratorMetadata.getAllEvents(object);
        for (let i = 0; i < eventsDetails.length; i++) {
            let details = eventsDetails[i];
            compositeDisposable.add(this.getEventObservable(modelId, details.eventName, details.observationStage).subscribe((eventEnvelope) => {
                // note if the code is uglifyied then details.functionName isn't going to mean much.
                // If you're packing your vendor bundles, or debug bundles separately then you can use the no-mangle-functions option to retain function names.
                if (!details.predicate || details.predicate(object, eventEnvelope.event)) {
                    this._diagnosticMonitor.dispatchingViaDirective(details.functionName);
                    if (details.decoratorType === DecoratorTypes.observeEvent) {
                        object[details.functionName](eventEnvelope.event, eventEnvelope.context, eventEnvelope.model);
                    } else {
                        object[details.functionName](eventEnvelope);
                    }
                }
            }));
        }
        compositeDisposable.add(() => {
            this._decoratorObservationRegister.removeRegistration(modelId, object);
        });
        return compositeDisposable;
    }

    private _observeEventsUsingConventions(modelId, object, methodPrefix) {
        let compositeDisposable = new CompositeDisposable();
        let props = utils.getPropertyNames(object);
        for (let i = 0; i < props.length; i++) {
            let prop = props[i];
            if (utils.startsWith(prop, methodPrefix)) {
                let stage = ObservationStage.normal;
                let eventName = prop.replace(methodPrefix, '');
                let observationStageSplitIndex = eventName.lastIndexOf('_');
                if (observationStageSplitIndex > 0) {
                    let stageSubstring = eventName.substring(observationStageSplitIndex + 1);
                    let stageSpecified = false;
                    if (stageSubstring === ObservationStage.preview) {
                        stage = ObservationStage.preview;
                        stageSpecified = true;
                    } else if (stageSubstring === ObservationStage.normal) {
                        stage = ObservationStage.normal;
                        stageSpecified = true;
                    } else if (stageSubstring === ObservationStage.committed) {
                        stage = ObservationStage.committed;
                        stageSpecified = true;
                    }
                    if (stageSpecified) {
                        eventName = eventName.substring(0, observationStageSplitIndex);
                    }
                }
                compositeDisposable.add(this.getEventObservable(modelId, eventName, stage).subscribe((eventEnvelope) => {
                    this._diagnosticMonitor.dispatchingViaConvention(prop);
                    object[prop](eventEnvelope.event, eventEnvelope.context, eventEnvelope.model);
                }));
            }
        }
        return compositeDisposable;
    }

    private _throwIfHaltedOrDisposed() {
        if (this._state.currentStatus === Status.Halted) {
            throw new Error(`ESP router halted due to previous unhandled error [${this._haltingException}]`);
        }
        if (this.isDisposed) {
            throw new Error(`ESP router has been disposed`);
        }
    }

    private _guardAgainstLegacyModelChangedEventSubscription(eventType: string) {
        let errorMessage = 'You can not observe a modelChangedEvent via router.getEventObservable(), use router.getModelChangedEvent() instead';
        Guard.isFalsey(eventType === Consts.modelChangedEvent, errorMessage);
        if ((<any>eventType).modelId) {
            // guard against the old format modelChangedEvents
            throw new Error(errorMessage);
        }
    }

    private _halt(err) {
        let isInitialHaltingError = this._state.currentStatus !== Status.Halted;

        this._state.moveToHalted();

        let modelIds = [...this._models.keys()];
        this._diagnosticMonitor.halted(modelIds, err);
        _log.error('The ESP router has caught an unhandled error and will halt', err);
        this._haltingException = err;

        // We run the onErrorHandlers after the
        // router has had time to set it's own state
        if (isInitialHaltingError) {
            this._onErrorHandlers.forEach(handler => {
                try {
                    handler(err);
                } catch (handlerError) {
                    _log.info(`Error handler errored. Ignoring and continuing, Error = ${handlerError}`, handlerError);
                }
            });
        }

        throw err;
    }
}
