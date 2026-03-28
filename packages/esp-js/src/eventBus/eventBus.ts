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

import {DefaultStoreAddress, StoreAddress, EventContext, ObservationStage, Status} from './';
import {State} from './state';
import {Observable, Subject} from '../reactive';
import {Guard, Logger, utils} from '../system';
import {DisposableBase} from '../system/disposables';
import {DispatchType, EventEnvelope, ModelEnvelope} from './envelopes';
import {EventRecord, StoreRecord} from './storeRecord';
import {DefaultEventContext} from './eventContext';
import {ReduxDevToolsDiagnosticMonitor, NoopDiagnosticMonitor, DiagnosticMonitor, reduxDevToolsDetectedAndEnabledInEsp} from './devtools';
import {StoreConfig, PublishDelegate} from '../model/types';
import {Subscribable} from '../model/subscribable';
import {StoreBuilder} from '../model/storeBuilder';
import {produce, freeze} from 'immer';

let _log = Logger.create('EventBus');

type Envelope = ModelEnvelope<any> | EventEnvelope<any, any>;

export class EventBus extends DisposableBase {
    private _models: Map<string, StoreRecord>;
    private _dispatchSubject: Subject<Envelope>;
    private _haltingException: Error;
    private _state: State;
    private _onErrorHandlers: Array<(error: Error) => void>;
    private _diagnosticMonitor: DiagnosticMonitor;

    public constructor() {
        super();
        this._models = new Map();
        this._haltingException = undefined;
        this._dispatchSubject = new Subject<Envelope>();
        this._onErrorHandlers = [];

        this._state = new State();

        this._diagnosticMonitor = reduxDevToolsDetectedAndEnabledInEsp()
            ? new ReduxDevToolsDiagnosticMonitor(`EventBus_${Date.now()}`)
            : new NoopDiagnosticMonitor();
        this.addDisposable(this._diagnosticMonitor);
    }

    public get currentStatus(): Status {
        return this._state.currentStatus;
    }

    public storeBuilder<TModel>(storeId: string, initialModel: TModel): StoreBuilder<TModel> {
        return StoreBuilder._create(
            (id: string, m: TModel, storeConfig: StoreConfig<TModel>) => this.addStore(id, m, storeConfig),
            storeId,
            initialModel
        );
    }

    private addStore<TModel>(storeId: string, initialModel: TModel, storeConfig: StoreConfig<TModel>): void {
        this._throwIfHaltedOrDisposed();
        Guard.isString(storeId, 'The storeId argument should be a string');
        Guard.isDefined(initialModel, 'The model argument must be defined');
        Guard.isDefined(storeConfig, 'The storeConfig argument must be defined');

        const storeRecord = this._getOrCreateStoreRecord(storeId) as StoreRecord<TModel>;
        if (storeRecord.hasModel) {
            throw new Error('The store with id [' + storeId + '] is already registered');
        }

        const publishDelegate: PublishDelegate = (eventType: string, event: any) => {
            this.publishEvent(storeId, eventType, event);
        };

        const frozenModel = freeze(initialModel, true) as TModel;
        storeRecord.upgradeToFullModel(frozenModel, storeConfig, publishDelegate);

        // Pre-register event streams for all known event types
        for (const eventType of storeConfig.eventHandlers.keys()) {
            storeRecord.getOrCreateEventStreamsRegistration(
                eventType,
                <Observable<EventEnvelope<any, any>>>this._dispatchSubject
            );
        }
        for (const eventType of storeConfig.previewHandlers.keys()) {
            storeRecord.getOrCreateEventStreamsRegistration(
                eventType,
                <Observable<EventEnvelope<any, any>>>this._dispatchSubject
            );
        }
        for (const eventType of storeConfig.effectHandlers.keys()) {
            storeRecord.getOrCreateEventStreamsRegistration(
                eventType,
                <Observable<EventEnvelope<any, any>>>this._dispatchSubject
            );
        }

        // Start subscription factories
        for (const factory of storeConfig.subscriptionFactories) {
            const disposable = factory(publishDelegate);
            if (disposable) {
                storeRecord.subscriptionDisposables.add(disposable);
            }
        }

        // Emit initial model update
        this._dispatchSubject.onNext({storeId: storeId, model: frozenModel, dispatchType: DispatchType.ModelUpdate});
        this._diagnosticMonitor.addStore(storeId);

    }

    public removeStore(storeId: string) {
        Guard.isString(storeId, 'The storeId argument should be a string');
        let storeRecord = this._models.get(storeId);
        if (storeRecord) {
            this._diagnosticMonitor.removeStore(storeId);
            storeRecord.wasRemoved = true;
            this._models.delete(storeId);
            storeRecord.dispose();
            this._dispatchSubject.onNext({storeId: storeId, model: undefined, dispatchType: DispatchType.ModelDelete});
        }
    }

    public isModelRegistered(storeId: string): boolean {
        Guard.isString(storeId, 'The storeId argument should be a string');
        const record = this._models.get(storeId);
        return record ? record.hasModel : false;
    }

    public isModelDispatchStatus(storeId: string, status: Status): boolean {
        return this._state.currentStoreRecord?.storeId === storeId && this._state.currentStatus === status;
    }

    /**
     * Exists for read only access to a model.
     *
     * Note: given this is JavaScript, it's up to the caller to not write against the model.
     * If you want to modify the model, publish an event to it.
     *
     * @param storeId
     */
    public getModel<TModel = object>(storeId: string): TModel {
        Guard.isString(storeId, 'The storeId argument should be a string');
        if (this._models.get(storeId)) {
            let storeRecord = this._models.get(storeId);
            if (!storeRecord.hasModel) {
                throw new Error(`Store with id ${storeId} is registered, however its model has not yet been set. Can not retrieve`);
            }
            return storeRecord.model as unknown as TModel;
        }
        return null;
    }

    /**
     * Exists to find a model for read only access.
     *
     * Note: given this is JavaScript, it's up to the caller to not write against the model.
     * If you want to modify the model, publish an event to it.
     *
     * Returns the found model else null.
     *
     * @param predicate = a predicate which is used as a test against each model. Will stop on first match
     */
    public findModel(predicate: (model: any) => boolean) {
        Guard.isFunction(predicate, 'predicate should be a function');
        for (let [key, value] of this._models) {
            if (value.hasModel) {
                if (predicate(value.model)) {
                    return value.model;
                }
            }
        }
        return null;
    }

    public publishEvent(storeId: string, eventType: string, event: any): void;
    public publishEvent(storeAddress: StoreAddress, eventType: string, event: any): void;
    public publishEvent(...args: any[]): void {
        this._throwIfHaltedOrDisposed();
        const storeAddress: StoreAddress = utils.isObject(args[0]) && args[0] instanceof DefaultStoreAddress
            ? args[0]
            : new DefaultStoreAddress(args[0]);
        const eventType = args[1];
        const event = args[2];
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument must be defined');
        if (this._state.currentStatus === Status.EventExecution) {
            throw new Error('You can not publish further events when performing an event execution. storeAddress: [' + storeAddress + '], eventType:[' + eventType + ']');
        }
        this._diagnosticMonitor.publishEvent(storeAddress, eventType, event);
        this._tryEnqueueEvent(storeAddress, eventType, event);
    }

    public broadcastEvent(eventType: string, event: any) {
        Guard.isString(eventType, 'The eventType argument should be a string');
        Guard.isDefined(event, 'The event argument should be defined');
        this._diagnosticMonitor.broadcastEvent(eventType);
        for (let [key, value] of this._models) {
            this._tryEnqueueEvent(new DefaultStoreAddress(value.storeId), eventType, event);
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
                this._state.currentStoreRecord,
                null,
                event,
                eventType
            );
        });
    }

    public getModelObservable<TModel>(storeId: string): Subscribable<TModel> {
        return Observable.create(o => {
            this._throwIfHaltedOrDisposed();
            Guard.isString(storeId, 'The storeId should be a string');
            let storeRecord = this._getOrCreateStoreRecord(storeId);
            return storeRecord.modelObservationStream
                .map(envelope => envelope.model)
                .subscribe(o);
        });
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

    public isOnDispatchLoopFor(storeId: string) {
        Guard.isString(storeId, 'storeId must be a string');
        Guard.isFalsey(storeId === '', 'storeId must not be empty');
        return this._state.currentStoreId === storeId;
    }

    private _getOrCreateStoreRecord(storeId: string): StoreRecord {
        let storeRecord: StoreRecord = this._models.get(storeId);
        if (!storeRecord) {
            // Create a shell record for lazy observation registration (getEventObservable / getModelObservable called before addStore)
            // This record has no handlers — it will be a proper record once addStore is called.
            // We create a minimal placeholder; however since we removed lazy addStore support,
            // we just create a modelObservationStream-only record with empty config.
            let modelObservationStream = this._dispatchSubject
                .cast<ModelEnvelope<any>>()
                .filter(envelope => envelope.dispatchType === DispatchType.ModelUpdate && envelope.storeId === storeId)
                .share(true);
            const emptyConfig = {
                eventHandlers: new Map(),
                previewHandlers: new Map(),
                effectHandlers: new Map(),
                subscriptionFactories: [],
            };
            const noopPublish: PublishDelegate = () => {};
            storeRecord = new StoreRecord(storeId, null, modelObservationStream, emptyConfig as any, noopPublish);
            this._models.set(storeId, storeRecord);
        }
        return storeRecord;
    }

    private _tryEnqueueEvent(storeAddress: StoreAddress, eventType: string, event: any) {
        // we allow for lazy model registration, you can observe a model but then register it later,
        // this means at this point when publishing an event we need to ensure the actual model is there.
        if (!this._models.has(storeAddress.storeId) || !this._models.get(storeAddress.storeId).model) {
            throw new Error('Can not publish event of type [' + eventType + '] as store with id [' + storeAddress.storeId + '] not registered');
        } else {
            try {
                if (this._models.has(storeAddress.storeId)) {
                    let storeRecord = this._getOrCreateStoreRecord(storeAddress.storeId);
                    if (storeRecord.tryEnqueueEvent(storeAddress.entityKey, eventType, event)) {
                        this._diagnosticMonitor.eventEnqueued(storeAddress.storeId, storeAddress.entityKey, eventType, event);
                        this._purgeEventQueues();
                    }
                }
            } catch (err) {
                this._halt(err);
            }
        }
    }

    private _purgeEventQueues() {
        if (this._state.currentStatus === Status.Idle) {
            let storeRecord = this._getNextStoreRecordWithQueuedEvents();
            let hasEvents = !!storeRecord;
            this._diagnosticMonitor.dispatchLoopStart();
            while (hasEvents) {
                let eventRecord: EventRecord = storeRecord.eventQueue.shift();
                this._diagnosticMonitor.startingModelEventLoop(storeRecord.storeId, eventRecord.entityKey, eventRecord.eventType);

                // Wrap the entire pre-processing → event dispatch → post-processing cycle in a
                // single immer produce so the model is a mutable draft throughout. Effects are
                // collected during dispatch and run against the resulting frozen model afterwards.
                const newModel = produce(storeRecord.currentModel, (draft: any) => {
                    storeRecord.currentModel = draft;

                    this._state.moveToPreProcessing(storeRecord.storeId, storeRecord);
                    this._diagnosticMonitor.preProcessingModel();
                    storeRecord.preEventProcessor(draft);

                    if (!storeRecord.wasRemoved) {
                        this._state.moveToEventDispatch();
                        this._diagnosticMonitor.dispatchingEvents();
                        while (hasEvents) {
                            this._state.eventsProcessed.push(eventRecord.eventType);
                            this._dispatchEventToEventProcessors(
                                storeRecord,
                                eventRecord.entityKey,
                                eventRecord.event,
                                eventRecord.eventType
                            );
                            if (storeRecord.wasRemoved) {
                                break;
                            }
                            storeRecord.hasReceivedEvent = true;
                            hasEvents = storeRecord.eventQueue.length > 0;
                            if (hasEvents) {
                                eventRecord = storeRecord.eventQueue.shift();
                            }
                        } // keep looping until any events from the dispatch to processors stage are processed
                        this._diagnosticMonitor.finishDispatchingEvent();
                        if (!storeRecord.wasRemoved) {
                            this._diagnosticMonitor.postProcessingModel();
                            this._state.moveToPostProcessing();
                            storeRecord.postEventProcessor(draft, this._state.eventsProcessed);
                        }
                    }
                });

                // Model is now frozen — restore it from the produce result
                storeRecord.currentModel = newModel as any;

                // Run collected effects against the frozen model, just before clearing the dispatch queue
                if (!storeRecord.wasRemoved && this._state.pendingEffects.length > 0) {
                    this._state.moveToEffectsProcessing();
                    for (const pe of this._state.pendingEffects) {
                        pe.handlers.forEach((h: any) => h(storeRecord.currentModel, pe.event, pe.eventContext, storeRecord.publishDelegate));
                    }
                }
                this._state.clearPendingEffects();

                if (!storeRecord.wasRemoved) {
                    this._state.clearEventDispatchQueue();
                }

                storeRecord.eventQueuePurged();
                // we now dispatch updates before processing the next model, if any
                this._state.moveToDispatchModelUpdates();
                this._dispatchModelUpdates();
                storeRecord = this._getNextStoreRecordWithQueuedEvents();
                hasEvents = !!storeRecord;
                this._diagnosticMonitor.endingModelEventLoop();
            }  // keep looping until any events raised during post event processing OR event that have come in for other models are processed
            this._state.moveToIdle();
            this._diagnosticMonitor.dispatchLoopEnd();
        }
    }

    private _dispatchEventToEventProcessors(storeRecord: StoreRecord, entityKey: string, event: any, eventType: string): void {
        let eventContext = new DefaultEventContext(
            storeRecord.storeId,
            eventType,
            entityKey
        );

        // --- preview stage: pass the draft directly ---
        const previewHandlers = storeRecord.previewHandlers.get(eventType);
        if (previewHandlers && previewHandlers.length > 0) {
            previewHandlers.forEach(h => h(storeRecord.currentModel, event, eventContext));
        }
        this._dispatchEvent(storeRecord, entityKey, event, eventType, eventContext, ObservationStage.preview);
        if (eventContext.isCommitted) {
            throw new Error('You can\'t commit an event at the preview stage. Event: [' + eventContext.eventType + '], StoreId: [' + storeRecord.storeId + ']');
        }

        if (!eventContext.isCanceled) {
            // --- normal stage: mutate the outer produce draft directly ---
            eventContext.updateCurrentState(ObservationStage.normal);
            const eventHandlers = storeRecord.eventHandlers.get(eventType);
            if (eventHandlers && eventHandlers.length > 0) {
                // storeRecord.currentModel is the immer draft from the outer produce in _purgeEventQueues
                eventHandlers.forEach(h => h(storeRecord.currentModel as any, event, eventContext));
            }
            this._dispatchEvent(storeRecord, entityKey, event, eventType, eventContext, ObservationStage.normal);
            if (eventContext.isCanceled) {
                throw new Error('You can\'t cancel an event at the normal stage. Event: [' + eventContext.eventType + '], StoreId: [' + storeRecord.storeId + ']');
            }

            let wasCommittedAtNormalStage = eventContext.isCommitted;
            if (wasCommittedAtNormalStage) {
                eventContext.updateCurrentState(ObservationStage.committed);
                this._dispatchEvent(storeRecord, entityKey, event, eventType, eventContext, ObservationStage.committed);
                if (eventContext.isCanceled) {
                    throw new Error('You can\'t cancel an event at the committed stage. Event: [' + eventContext.eventType + '], StoreId: [' + storeRecord.storeId + ']');
                }
            }

            // --- final stage ---
            eventContext.updateCurrentState(ObservationStage.final);
            this._dispatchEvent(storeRecord, entityKey, event, eventType, eventContext, ObservationStage.final);
            if (eventContext.isCanceled) {
                throw new Error('You can\'t cancel an event at the final stage. Event: [' + eventContext.eventType + '], StoreId: [' + storeRecord.storeId + ']');
            }
            if (!wasCommittedAtNormalStage && eventContext.isCommitted) {
                throw new Error('You can\'t commit an event at the final stage. Event: [' + eventContext.eventType + '], StoreId: [' + storeRecord.storeId + ']');
            }

            // --- collect effects to run after produce completes with the frozen model ---
            const effectHandlers = storeRecord.effectHandlers.get(eventType);
            if (effectHandlers && effectHandlers.length > 0) {
                this._state.pendingEffects.push({handlers: effectHandlers, event, eventContext});
            }
        }
    }

    private _dispatchEvent(storeRecord: StoreRecord, entityKey: string, event: any, eventType: string, context: EventContext, stage: ObservationStage) {
        this._diagnosticMonitor.dispatchingEvent(eventType, stage);
        storeRecord.eventDispatchProcessor(storeRecord.model, eventType, event, stage);
        this._dispatchSubject.onNext({
            event: event,
            eventType: eventType,
            storeId: storeRecord.storeId,
            entityKey: entityKey,
            model: storeRecord.model,
            context: context,
            observationStage: stage,
            dispatchType: DispatchType.Event
        });
        storeRecord.eventDispatchedProcessor(storeRecord.model, eventType, event, stage);
    }

    private _dispatchModelUpdates() {
        let updates: StoreRecord[] = [];
        for (let [key, value] of this._models) {
            if (value.hasReceivedEvent) {
                value.hasReceivedEvent = false;
                updates.push(value);
            }
        }
        for (let i = 0, len = updates.length; i < len; i++) {
            let storeRecord: StoreRecord = updates[i];
            this._diagnosticMonitor.dispatchingModelUpdates(storeRecord.storeId, storeRecord.model);
            this._dispatchSubject.onNext({
                storeId: storeRecord.storeId,
                model: storeRecord.model,
                dispatchType: DispatchType.ModelUpdate
            });
        }
    }

    /**
     * Tries to find a StoreRecord with pending events.
     * StoreRecords with older enqueued events are returned first.
     * @private
     */
    private _getNextStoreRecordWithQueuedEvents(): StoreRecord {
        let candidate: StoreRecord = null;
        let dirtyEpochMs: number = Date.now();
        for (let [key, value] of this._models) {
            if (value.eventQueue.length > 0 && value.eventQueueDirtyEpochMs <= dirtyEpochMs) {
                candidate = value;
                dirtyEpochMs = value.eventQueueDirtyEpochMs;
            }
        }
        return candidate;
    }

    private _throwIfHaltedOrDisposed() {
        if (this._state.currentStatus === Status.Halted) {
            throw new Error(`ESP event bus halted due to previous unhandled error [${this._haltingException}]`);
        }
        if (this.isDisposed) {
            throw new Error(`ESP event bus has been disposed`);
        }
    }

    private _halt(err: any) {
        let isInitialHaltingError = this._state.currentStatus !== Status.Halted;

        this._state.moveToHalted();

        let storeIds = [...this._models.keys()];
        this._diagnosticMonitor.halted(storeIds, err);
        let errorMessage = 'The ESP event bus has caught an unhandled error and will halt';
        _log.error(errorMessage, err);
        this._haltingException = err;

        // We run the onErrorHandlers after the
        // bus has had time to set it's own state
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
